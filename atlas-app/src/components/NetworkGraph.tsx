import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { NetworkData, TimelineNode } from './TimelineView';

export const NetworkGraph: React.FC = () => {
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const result: NetworkData = await invoke('get_network_graph', { limit: 40 });
        setData(result);
      } catch (err) {
        console.error("Failed to fetch graph network:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  // Compute deterministic circular coordinates for up to N nodes so they float evenly around the canvas
  const getNodePosition = (index: number, total: number) => {
    const radius = Math.min(260, 100 + total * 8);
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
    const cx = 400 + Math.cos(angle) * radius;
    const cy = 300 + Math.sin(angle) * radius;
    return { cx, cy };
  };

  const getGlowColor = (type: string) => {
    if (type.includes('chat') || type === 'user_entry') return '#06b6d4';
    if (type.includes('voice') || type.includes('audio')) return '#10b981';
    if (type.includes('file') || type.includes('observed')) return '#8b5cf6';
    return '#f59e0b';
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 160px)', maxWidth: 1100, margin: '0 auto' }}>
      
      {/* Left Box: SVG Visual Network Map */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-primary)' }}>🕸️ Interactive Graph Canvas</h3>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {data?.nodes.length || 0} nodes · {data?.edges.length || 0} edges
          </span>
        </div>

        <div style={{ flex: 1, backgroundColor: '#080c14', borderRadius: 12, border: '1px solid var(--color-border-subtle)', position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>Loading SVG network canvas...</div>
          ) : !data || data.nodes.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', padding: 20, textAlign: 'center' }}>
              Identity Graph is empty. Add notes or record audio in the Chat tab to see your visual neural map grow!
            </div>
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 800 600">
              {/* Draw Relationship Edges first so they sit behind nodes */}
              {data.edges.map(edge => {
                const srcIdx = data.nodes.findIndex(n => n.id === edge.source_node_id);
                const tgtIdx = data.nodes.findIndex(n => n.id === edge.target_node_id);
                if (srcIdx === -1 || tgtIdx === -1) return null;
                const srcPos = getNodePosition(srcIdx, data.nodes.length);
                const tgtPos = getNodePosition(tgtIdx, data.nodes.length);

                return (
                  <g key={edge.id}>
                    <line
                      x1={srcPos.cx}
                      y1={srcPos.cy}
                      x2={tgtPos.cx}
                      y2={tgtPos.cy}
                      stroke="rgba(6, 182, 212, 0.35)"
                      strokeWidth="1.5"
                      strokeDasharray={edge.relationship_type === 'similar' ? '4 4' : 'none'}
                    />
                    <text
                      x={(srcPos.cx + tgtPos.cx) / 2}
                      y={(srcPos.cy + tgtPos.cy) / 2 - 4}
                      fill="rgba(255,255,255,0.4)"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {edge.relationship_type}
                    </text>
                  </g>
                );
              })}

              {/* Draw Identity Hub Nodes */}
              {data.nodes.map((node, idx) => {
                const pos = getNodePosition(idx, data.nodes.length);
                const isSelected = selectedNode?.id === node.id;
                const color = getGlowColor(node.entity_type);

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  >
                    {/* Outer Glow Circle */}
                    <circle
                      cx={pos.cx}
                      cy={pos.cy}
                      r={isSelected ? 26 : 20}
                      fill={color}
                      opacity={isSelected ? 0.35 : 0.15}
                    />
                    {/* Inner Node Core */}
                    <circle
                      cx={pos.cx}
                      cy={pos.cy}
                      r={isSelected ? 14 : 11}
                      fill="#0f172a"
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    {/* Node Label */}
                    <text
                      x={pos.cx}
                      y={pos.cy + 28}
                      fill={isSelected ? '#fff' : 'var(--color-text-secondary)'}
                      fontSize="11"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {node.name.length > 18 ? node.name.substring(0, 16) + '…' : (node.name || node.id)}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Right Column: Node Details Panel */}
      <div style={{
        width: 340,
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-primary)' }}>🏷️ Node Details</h3>
        {selectedNode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, color: getGlowColor(selectedNode.entity_type), fontWeight: 600 }}>
              TYPE: {selectedNode.entity_type.toUpperCase()}
            </div>
            <h4 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-primary)' }}>{selectedNode.name || selectedNode.id}</h4>
            <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border-subtle)', fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {selectedNode.content}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Logged: {new Date(selectedNode.created_at > 10000000000 ? selectedNode.created_at : selectedNode.created_at * 1000).toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Node ID: <code>{selectedNode.id}</code>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: 20 }}>
            Click any circular node on the interactive Canvas to view its exact payload and relationships!
          </div>
        )}
      </div>

    </div>
  );
};
