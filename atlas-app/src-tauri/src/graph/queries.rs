use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use crate::errors::Result;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimelineNode {
    pub id: String,
    pub entity_type: String,
    pub name: String,
    pub content: String,
    pub created_at: i64,
    pub version: i32,
    pub is_current: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GraphEdge {
    pub id: String,
    pub source_node_id: String,
    pub target_node_id: String,
    pub relationship_type: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkData {
    pub nodes: Vec<TimelineNode>,
    pub edges: Vec<GraphEdge>,
}

/// Query nodes formatted for the chronological timeline feed
pub fn get_timeline_nodes(
    conn: &Connection,
    limit: u32,
    offset: u32,
    filter_type: Option<String>,
) -> Result<Vec<TimelineNode>> {
    let query = match filter_type {
        Some(ref t) if !t.is_empty() && t != "ALL" => {
            "SELECT id, entity_type, name, content, created_at, version, is_current FROM nodes WHERE is_current = 1 AND entity_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
        }
        _ => {
            "SELECT id, entity_type, name, content, created_at, version, is_current FROM nodes WHERE is_current = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?"
        }
    };

    let mut stmt = conn.prepare(query)?;
    let mut rows = if let Some(ref t) = filter_type {
        if !t.is_empty() && t != "ALL" {
            stmt.query(rusqlite::params![t, limit as i64, offset as i64])?
        } else {
            stmt.query(rusqlite::params![limit as i64, offset as i64])?
        }
    } else {
        stmt.query(rusqlite::params![limit as i64, offset as i64])?
    };

    let mut nodes = Vec::new();
    while let Some(row) = rows.next()? {
        nodes.push(TimelineNode {
            id: row.get(0)?,
            entity_type: row.get(1)?,
            name: row.get(2)?,
            content: row.get(3)?,
            created_at: row.get(4)?,
            version: row.get(5)?,
            is_current: row.get(6)?,
        });
    }

    Ok(nodes)
}

/// Query top nodes and all relationships between them for visual network rendering
pub fn get_graph_network(conn: &Connection, limit: u32) -> Result<NetworkData> {
    let mut stmt = conn.prepare(
        "SELECT id, entity_type, name, content, created_at, version, is_current FROM nodes WHERE is_current = 1 ORDER BY created_at DESC LIMIT ?"
    )?;

    let mut nodes = Vec::new();
    let mut node_ids = Vec::new();
    let mut rows = stmt.query(rusqlite::params![limit as i64])?;

    while let Some(row) = rows.next()? {
        let id: String = row.get(0)?;
        node_ids.push(id.clone());
        nodes.push(TimelineNode {
            id,
            entity_type: row.get(1)?,
            name: row.get(2)?,
            content: row.get(3)?,
            created_at: row.get(4)?,
            version: row.get(5)?,
            is_current: row.get(6)?,
        });
    }

    let mut edges = Vec::new();
    if !node_ids.is_empty() {
        let placeholders = vec!["?"; node_ids.len()].join(", ");
        let edge_query = format!(
            "SELECT id, source_node_id, target_node_id, relationship_type, created_at FROM edges WHERE source_node_id IN ({}) OR target_node_id IN ({})",
            placeholders, placeholders
        );

        let mut edge_params: Vec<&dyn rusqlite::ToSql> = Vec::new();
        for id in &node_ids {
            edge_params.push(id);
        }
        for id in &node_ids {
            edge_params.push(id);
        }

        let mut edge_stmt = conn.prepare(&edge_query)?;
        let mut edge_rows = edge_stmt.query(rusqlite::params_from_iter(edge_params))?;

        while let Some(row) = edge_rows.next()? {
            edges.push(GraphEdge {
                id: row.get(0)?,
                source_node_id: row.get(1)?,
                target_node_id: row.get(2)?,
                relationship_type: row.get(3)?,
                created_at: row.get(4)?,
            });
        }
    }

    Ok(NetworkData { nodes, edges })
}

/// Query immediate neighbors of a specific node
pub fn get_node_neighbors(conn: &Connection, node_id: &str) -> Result<NetworkData> {
    let mut edge_stmt = conn.prepare(
        "SELECT id, source_node_id, target_node_id, relationship_type, created_at FROM edges WHERE source_node_id = ? OR target_node_id = ?"
    )?;

    let mut edges = Vec::new();
    let mut neighbor_ids = vec![node_id.to_string()];
    let mut edge_rows = edge_stmt.query(rusqlite::params![node_id, node_id])?;

    while let Some(row) = edge_rows.next()? {
        let src: String = row.get(1)?;
        let tgt: String = row.get(2)?;
        if !neighbor_ids.contains(&src) {
            neighbor_ids.push(src.clone());
        }
        if !neighbor_ids.contains(&tgt) {
            neighbor_ids.push(tgt.clone());
        }
        edges.push(GraphEdge {
            id: row.get(0)?,
            source_node_id: src,
            target_node_id: tgt,
            relationship_type: row.get(3)?,
            created_at: row.get(4)?,
        });
    }

    let mut nodes = Vec::new();
    for nid in neighbor_ids {
        if let Ok(row) = conn.query_row(
            "SELECT id, entity_type, name, content, created_at, version, is_current FROM nodes WHERE id = ?",
            [nid],
            |row| {
                Ok(TimelineNode {
                    id: row.get(0)?,
                    entity_type: row.get(1)?,
                    name: row.get(2)?,
                    content: row.get(3)?,
                    created_at: row.get(4)?,
                    version: row.get(5)?,
                    is_current: row.get(6)?,
                })
            },
        ) {
            nodes.push(row);
        }
    }

    Ok(NetworkData { nodes, edges })
}
