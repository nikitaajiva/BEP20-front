"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users, DollarSign, Layers, Search, Filter, ChevronDown, ChevronRight, Eye } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
// Dummy data generator
const generateDummyData = () => {
  return [
    {
      id: "usr1",
      name: "Alice Smith",
      parent: "root",
      level: 1,
      amount: 1500,
      totalReferrals: 3,
      status: "Active",
      children: [
        {
          id: "usr1-1",
          name: "Bob Johnson",
          parent: "Alice Smith",
          level: 2,
          amount: 500,
          totalReferrals: 1,
          status: "Active",
          children: [
            {
              id: "usr1-1-1",
              name: "Charlie Davis",
              parent: "Bob Johnson",
              level: 3,
              amount: 200,
              totalReferrals: 0,
              status: "Inactive",
              children: []
            }
          ]
        },
        {
          id: "usr1-2",
          name: "Diana Prince",
          parent: "Alice Smith",
          level: 2,
          amount: 800,
          totalReferrals: 0,
          status: "Active",
          children: []
        }
      ]
    },
    {
      id: "usr2",
      name: "Evan Wright",
      parent: "root",
      level: 1,
      amount: 2200,
      totalReferrals: 2,
      status: "Active",
      children: [
        {
          id: "usr2-1",
          name: "Fiona Gallagher",
          parent: "Evan Wright",
          level: 2,
          amount: 1100,
          totalReferrals: 0,
          status: "Active",
          children: []
        }
      ]
    },
    {
      id: "usr3",
      name: "George Miller",
      parent: "root",
      level: 1,
      amount: 450,
      totalReferrals: 0,
      status: "Inactive",
      children: []
    }
  ];
};

const TreeNode = ({ node, isExpanded, onToggle }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px',
          cursor: hasChildren ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          marginLeft: `${(node.level - 1) * 20}px`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 184, 0, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 184, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
        }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hasChildren && (
            isExpanded ? <ChevronDown size={16} color="#FFB800" /> : <ChevronRight size={16} color="#FFB800" />
          )}
        </div>
        
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {node.name}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{node.parent === 'root' ? '---' : node.parent}</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
            <span style={{ padding: '2px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', fontSize: '11px' }}>
              Level {node.level}
            </span>
          </div>
          <div style={{ color: '#00ff00', fontWeight: 600, fontSize: '14px' }}>${node.amount.toLocaleString()}</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{node.totalReferrals}</div>
          <div>
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: '12px', 
              fontSize: '11px', 
              fontWeight: 600,
              background: node.status === 'Active' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
              color: node.status === 'Active' ? '#00ff00' : '#ff4444'
            }}>
              {node.status}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div style={{ marginTop: '8px', position: 'relative' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {node.children.map(child => (
              <TreeNode 
                key={child.id} 
                node={child} 
                isExpanded={isExpanded} // Simplification: all expanded if parent is expanded in this demo
                onToggle={onToggle} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ReferralLevelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const levelParam = searchParams.get('level');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [expandedNodes, setExpandedNodes] = useState(new Set(['usr1', 'usr1-1', 'usr2']));
  
  const dummyData = generateDummyData();

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Flatten logic for simple table view
  const flattenTree = (nodes, result = []) => {
    nodes.forEach(node => {
      result.push(node);
      if (node.children) flattenTree(node.children, result);
    });
    return result;
  };
  
  const allNodes = flattenTree(dummyData);
  
  // Apply filters
  const filteredNodes = allNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          node.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'All' || node.level.toString() === filterLevel;
    
    // If level param exists from URL, filter by that level specifically
    const matchesUrlLevel = !levelParam || node.level.toString() === levelParam;
    
    return matchesSearch && matchesLevel && matchesUrlLevel;
  });

  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <DashboardNavbar user={user} onLogout={logout} />
        
        <div style={{ flex: 1, padding: '24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Top Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 184, 0, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#fff' }}>
              {levelParam ? `Level ${levelParam} Details` : 'Network Structure'}
            </h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              View and manage your entire referral hierarchy
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { title: 'Total Members', value: allNodes.length, icon: <Users size={24} color="#FFB800" /> },
            { title: 'Total Amount', value: `$${allNodes.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, icon: <DollarSign size={24} color="#00ff00" /> },
            { title: 'Total Sub-levels', value: Math.max(...allNodes.map(n => n.level)), icon: <Layers size={24} color="#00d2ff" /> }
          ].map((card, i) => (
            <div key={i} style={{ 
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative glow */}
              <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100px', height: '100px', background: 'rgba(255,184,0,0.1)', filter: 'blur(40px)', borderRadius: '50%' }} />
              
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                {card.icon}
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  {card.title}
                </div>
                <div style={{ color: '#fff', fontSize: '28px', fontWeight: 800 }}>
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px', 
                  padding: '12px 16px 12px 48px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <Filter size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px', 
                  padding: '12px 40px 12px 48px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="All" style={{ background: '#111' }}>All Levels</option>
                <option value="1" style={{ background: '#111' }}>Level 1</option>
                <option value="2" style={{ background: '#111' }}>Level 2</option>
                <option value="3" style={{ background: '#111' }}>Level 3</option>
              </select>
              <ChevronDown size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Data Container */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', overflowX: 'auto' }}>
          
          {/* Table Header */}
          <div style={{ 
            display: 'flex', 
            padding: '0 16px 16px 40px', 
            borderBottom: '1px solid rgba(255,255,255,0.1)', 
            marginBottom: '16px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', gap: '16px' }}>
              <div>User Name</div>
              <div>Parent User</div>
              <div>Level</div>
              <div>Amount</div>
              <div>Total Referrals</div>
              <div>Status</div>
            </div>
          </div>

          {/* Tree View (Default) or Flat View (If searching/filtering) */}
          <div style={{ minWidth: '800px' }}>
            {(searchTerm || filterLevel !== 'All' || levelParam) ? (
              // Flat View
              filteredNodes.length > 0 ? (
                filteredNodes.map(node => (
                  <TreeNode 
                    key={node.id} 
                    node={{...node, children: []}} // Prevent expanding in flat view
                    isExpanded={false}
                    onToggle={() => {}} 
                  />
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                  No members found matching your criteria.
                </div>
              )
            ) : (
              // Tree View
              dummyData.map(node => (
                <TreeNode 
                  key={node.id} 
                  node={node} 
                  isExpanded={expandedNodes.has(node.id)}
                  onToggle={toggleNode} 
                />
              ))
            )}
          </div>
        </div>

        {/* Pagination Dummy */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '0 8px' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            Showing 1 to {filteredNodes.length} of {allNodes.length} members
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '8px 16px', 
              color: 'rgba(255,255,255,0.4)', 
              cursor: 'not-allowed',
              fontSize: '13px',
              fontWeight: 600
            }}>Previous</button>
            <button style={{ 
              background: 'rgba(255, 184, 0, 0.1)', 
              border: '1px solid rgba(255, 184, 0, 0.2)', 
              borderRadius: '8px', 
              padding: '8px 16px', 
              color: '#FFB800', 
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}>1</button>
            <button style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '8px 16px', 
              color: '#fff', 
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}>Next</button>
          </div>
        </div>

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
