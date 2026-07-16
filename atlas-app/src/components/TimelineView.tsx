import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface TimelineNode {
  id: string;
  entity_type: string;
  name: string;
  content: string;
  created_at: number;
  version: number;
  is_current: number;
}

export interface GraphEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: string;
  created_at: number;
}

export interface NetworkData {
  nodes: TimelineNode[];
  edges: GraphEdge[];
}

export const TimelineView: React.FC = () => {
  const [nodes, setNodes] = useState<TimelineNode[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);
  const [neighbors, setNeighbors] = useState<NetworkData | null>(null);

  const fetchTimeline = async (filterType: string) => {
    setLoading(true);
    try {
      const result: TimelineNode[] = await invoke('get_timeline_feed', {
        limit: 50,
        offset: 0,
        filterType: filterType === 'ALL' ? null : filterType
      });
      setNodes(result);
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline(filter);
  }, [filter]);

  // When a node is clicked, fetch its immediate graph neighborhood
  const handleSelectNode = async (node: TimelineNode) => {
    setSelectedNode(node);
    try {
      const net: NetworkData = await invoke('get_node_network', { nodeId: node.id });
      setNeighbors(net);
    } catch (err) {
      console.error("Failed to fetch node network:", err);
      setNeighbors(null);
    }
  };

  const getEntityIcon = (type: string) => {
    if (type.includes('chat') || type === 'user_entry') return '💬';
    if (type.includes('voice') || type.includes('audio')) return '🎙️';
    if (type.includes('file') || type.includes('observed')) return '📄';
    if (type.includes('git') || type.includes('commit')) return '💻';
    return '🧠';
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts > 10000000000 ? ts : ts * 1000);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 160px)', maxWidth: 1100, margin: '0 auto' }}>
      
      {/* Left Column: Filterable Chronological Feed */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: 18,
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-primary)' }}>⏳ Chronological Identity Timeline</h3>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{nodes.length} events logged</span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ALL', 'chat', 'voice_note', 'observed_file', 'git_commit'].map(item => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${filter === item ? 'var(--color-accent-cyan)' : 'var(--color-border-subtle)'}`,
                backgroundColor: filter === item ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: filter === item ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {item === 'ALL' ? '🌟 All Events' : `${getEntityIcon(item)} ${item}`}
            </button>
          ))}
        </div>

        {/* Timeline List Scroll Box */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 6 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading Identity Graph feed...</div>
          ) : nodes.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>No timeline entries found under filter '{filter}'. Talk to Atlas in the Chat tab to start populating memories!</div>
          ) : (
            nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => handleSelectNode(node)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: selectedNode?.id === node.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--color-bg-base)',
                  border: `1px solid ${selectedNode?.id === node.id ? 'var(--color-accent-cyan)' : 'var(--color-border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{getEntityIcon(node.entity_type)}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{node.name || node.id}</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }}>v{node.version}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatTimestamp(node.created_at)}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {node.content || "No text payload"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Node Details & Neighbor Connections View */}
      <div style={{
        width: 380,
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-primary)' }}>🔗 Memory Neighborhood</h3>
        
        {selectedNode ? (
          <>
            {/* Selected Node Box */}
            <div style={{ padding: 14, borderRadius: 10, backgroundColor: 'var(--color-bg-base)', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-accent-cyan)', fontWeight: 600 }}>SELECTED ENTRY ({selectedNode.entity_type})</div>
              <h4 style={{ margin: '6px 0', fontSize: 15, color: 'var(--color-text-primary)' }}>{selectedNode.name || selectedNode.id}</h4>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {selectedNode.content}
              </p>
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                ID: <code>{selectedNode.id}</code>
              </div>
            </div>

            {/* Connected Neighbors List */}
            <div>
              <h4 style={{ fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 8 }}>Connected Edges & Relationships</h4>
              {neighbors && neighbors.edges.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {neighbors.edges.map(edge => {
                    const otherNodeId = edge.source_node_id === selectedNode.id ? edge.target_node_id : edge.source_node_id;
                    const otherNode = neighbors.nodes.find(n => n.id === otherNodeId);
                    return (
                      <div key={edge.id} style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)', fontSize: 12 }}>
                        <span style={{ color: 'var(--color-accent-cyan)', fontWeight: 600 }}>{edge.relationship_type.toUpperCase()}</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}> → </span>
                        <span style={{ color: '#fff', fontWeight: 500 }}>{otherNode?.name || otherNodeId}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No explicit graph edges linked to this node yet.</div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: 20 }}>
            Click any entry on the chronological timeline to view its deep content, raw payload, and connected identity graph relationships!
          </div>
        )}
      </div>

    </div>
  );
};
