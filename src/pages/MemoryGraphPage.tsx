import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Share2, ZoomIn, ZoomOut, RotateCcw, Filter, MapPin, Users, Layers, Sparkles } from 'lucide-react';
import { Memory, Person, Collection } from '../types';

interface MemoryGraphPageProps {
  memories: Memory[];
  people: Person[];
  collections: Collection[];
  onSelectMemory: (memory: Memory) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'memory' | 'place' | 'person' | 'collection';
  val: number;
  data?: any;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
}

export function MemoryGraphPage({
  memories,
  people,
  collections,
  onSelectMemory,
}: MemoryGraphPageProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Build nodes and links data
  const { nodes, links } = useMemo(() => {
    const nodesMap = new Map<string, GraphNode>();
    const graphLinks: GraphLink[] = [];

    // 1. Add Memories
    memories.forEach((m) => {
      const memNodeId = `mem_${m.id}`;
      nodesMap.set(memNodeId, {
        id: memNodeId,
        name: m.title,
        type: 'memory',
        val: 18,
        data: m,
      });

      // 2. Add Place Node
      const placeName = m.locationName.split(',')[0].trim();
      const placeNodeId = `place_${placeName.toLowerCase().replace(/\s+/g, '_')}`;
      if (!nodesMap.has(placeNodeId)) {
        nodesMap.set(placeNodeId, {
          id: placeNodeId,
          name: placeName,
          type: 'place',
          val: 15,
          data: { locationName: m.locationName },
        });
      }
      graphLinks.push({
        source: memNodeId,
        target: placeNodeId,
        relation: 'located_at',
      });

      // 3. Link People
      if (m.people && m.people.length > 0) {
        m.people.forEach((p) => {
          const personNodeId = `person_${p.toLowerCase().replace(/\s+/g, '_')}`;
          if (!nodesMap.has(personNodeId)) {
            nodesMap.set(personNodeId, {
              id: personNodeId,
              name: p,
              type: 'person',
              val: 14,
              data: { name: p },
            });
          }
          graphLinks.push({
            source: memNodeId,
            target: personNodeId,
            relation: 'with_person',
          });
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links: graphLinks,
    };
  }, [memories, people, collections]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', [0, 0, width, height]);

    // Zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Filter nodes if user chose specific filter
    const activeNodes = nodes.filter((n) => {
      if (filterType === 'all') return true;
      if (filterType === 'memories') return n.type === 'memory';
      if (filterType === 'places') return n.type === 'place' || n.type === 'memory';
      if (filterType === 'people') return n.type === 'person' || n.type === 'memory';
      return true;
    });

    const activeNodeIds = new Set(activeNodes.map((n) => n.id));
    const activeLinks = links.filter((l) => {
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return activeNodeIds.has(srcId) && activeNodeIds.has(tgtId);
    });

    // Color definitions
    const getNodeColor = (type: string) => {
      switch (type) {
        case 'memory':
          return '#10b981'; // Emerald
        case 'place':
          return '#d97706'; // Amber
        case 'person':
          return '#6366f1'; // Indigo
        default:
          return '#f43f5e'; // Rose
      }
    };

    // D3 Force Simulation
    const simulation = d3.forceSimulation<GraphNode>(activeNodes)
      .force(
        'link',
        d3.forceLink<GraphNode, GraphLink>(activeLinks)
          .id((d) => d.id)
          .distance(70)
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.val + 10));

    // Draw Links
    const link = g
      .append('g')
      .attr('stroke', '#44403c')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(activeLinks)
      .join('line')
      .attr('stroke-width', 1.5);

    // Draw Node Groups
    const node = g
      .append('g')
      .selectAll('g')
      .data(activeNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        (d3.drag<any, GraphNode>() as any)
          .on('start', (event: any, d: GraphNode) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event: any, d: GraphNode) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event: any, d: GraphNode) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Circles
    node
      .append('circle')
      .attr('r', (d) => d.val)
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all hover:opacity-80')
      .on('click', (_, d) => {
        setSelectedNode(d);
        if (d.type === 'memory' && d.data) {
          onSelectMemory(d.data);
        }
      });

    // Labels
    node
      .append('text')
      .text((d) => d.name)
      .attr('x', (d) => d.val + 5)
      .attr('y', 4)
      .attr('fill', '#f5f5f4')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, filterType]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-600" />
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              Memory Graph Visualization
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            An interactive topological network showing how your places, memories, and friends connect.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-white p-2 px-3 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-stone-700">Memory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-stone-700">Place</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-stone-700">Person</span>
          </div>
        </div>
      </div>

      {/* Graph Stage */}
      <div 
        ref={containerRef}
        className="relative w-full h-[620px] rounded-3xl bg-stone-950 border border-stone-800 shadow-2xl overflow-hidden"
      >
        {/* Floating Filter Pills */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-stone-800">
          {[
            { id: 'all', label: 'All Connections' },
            { id: 'places', label: 'Places & Memories' },
            { id: 'people', label: 'People & Memories' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* SVG Graph */}
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Node Hover/Click Info Box */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 z-10 p-4 rounded-2xl bg-stone-900/95 backdrop-blur-md border border-stone-700 text-stone-100 max-w-sm shadow-xl animate-in slide-in-from-bottom-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              {selectedNode.type}
            </span>
            <h4 className="font-serif-editorial text-base font-bold text-white mt-0.5">
              {selectedNode.name}
            </h4>
            {selectedNode.type === 'memory' && (
              <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                Click node to view full memory story & album photos.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
