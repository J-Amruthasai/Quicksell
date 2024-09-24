import React, { useEffect, useState } from 'react';
import TicketCard from './TicketCard';

const userColors = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFBD33',
  '#FF3380', '#33FFD2', '#7D33FF', '#FFB533', '#33FF57',
  '#3383FF', '#FF3357', '#57FF33'
];

const statusImages = {
  "In progress": "/path_to_in_progress_image.png",
  "Todo": "/path_to_todo_image.png",
  "Backlog": "/path_to_backlog_image.png",
  "Done": "/path_to_done_image.png",          // New status image
  "Cancelled": "/path_to_cancel_image.png" // New status image
};

const priorityImages = {
  4: "/path_to_urgent_image.png",
  3: "/path_to_high_image.png",
  2: "/path_to_medium_image.png",
  1: "/path_to_low_image.png",
  0: "/path_to_no_priority_image.png"
};

const priorityNames = {
  4: "Urgent",
  3: "High",
  2: "Medium",
  1: "Low",
  0: "No priority",
};

// Styles for the Display button and dropdown
const displayButtonStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #ccc',
  padding: '10px 15px',
  borderRadius: '5px',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  fontSize: '16px',
  color: '#333',
};

const dropdownContainerStyle = {
  position: 'absolute',
  backgroundColor: 'white',
  border: '1px solid #ccc',
  padding: '10px',
  zIndex: 10,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const TicketApp = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState('status');
  const [sortBy, setSortBy] = useState('title');
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch tickets and users
  useEffect(() => {
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then(response => response.json())
      .then(data => {
        setTickets(data.tickets);
        setUsers(data.users);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSelect = (id) => {
    setSelectedTickets(prev => {
      const newSelected = new Set(prev);
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
      return newSelected;
    });
  };

  const getUserName = (userId) => {
    const user = users.find(user => user.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getUserColor = (userId) => {
    const index = users.findIndex(user => user.id === userId);
    return userColors[index % userColors.length];
  };

  // Group tickets by selected criteria
  const groupTickets = (tickets) => {
    const grouped = tickets.reduce((grouped, ticket) => {
      const key = groupBy === 'userId' ? getUserName(ticket.userId) 
                  : (groupBy === 'priority' ? priorityNames[ticket[groupBy]] : ticket[groupBy]);

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ticket);
      return grouped;
    }, {});

    // Include "Done" and "Cancelled" statuses even if there are no tickets
    if (groupBy === 'status') {
      ['Done', 'Cancelled'].forEach(status => {
        if (!grouped[status]) grouped[status] = []; // Ensure they are present
      });
    }

    return grouped;
  };

  // Sort tickets based on selected criteria
  const sortTickets = (tickets) => {
    return tickets.sort((a, b) => {
      return sortBy === 'title' 
        ? a.title.localeCompare(b.title) 
        : b.priority - a.priority; // Sort by priority
    });
  };

  const groupedTickets = groupTickets(tickets);
  const sortedGroupedTickets = Object.entries(groupedTickets).map(([key, group]) => ({
    groupKey: key,
    tickets: sortTickets(group),
  }));

  const getHeaderImage = (key) => {
    if (groupBy === 'status') return statusImages[key];
    if (groupBy === 'userId') {
      const user = users.find(user => user.name === key);
      return user ? getUserColor(user.id) : null; // Return user color
    }
    if (groupBy === 'priority') {
      const priorityLevel = Object.keys(priorityNames).find(p => priorityNames[p] === key);
      return priorityImages[priorityLevel];
    }
    return null;
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '20px' }}>
      {/* Display section */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
          style={displayButtonStyle}
        >
          Display <span style={{ fontSize: '12px' }}>▼</span>
        </button>
        {isDropdownOpen && (
          <div style={dropdownContainerStyle}>
            <div>
              <label>Grouping:</label>
              <select onChange={(e) => setGroupBy(e.target.value)} style={{ marginLeft: '10px' }}>
                <option value="status">Status</option>
                <option value="userId">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div style={{ marginTop: '10px' }}>
              <label>Ordering:</label>
              <select onChange={(e) => setSortBy(e.target.value)} style={{ marginLeft: '10px' }}>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal scroll container for side-by-side categories */}
      <div style={{ 
        display: 'flex', 
        overflowX: 'auto',
        gap: '2px',
        padding: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        {sortedGroupedTickets.map(({ groupKey, tickets }) => (
          <div key={groupKey} style={{ minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {groupBy === 'userId' && (
                  <div 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: getHeaderImage(groupKey), 
                      marginRight: '10px' 
                    }} 
                  />
                )}
                {groupBy !== 'userId' && getHeaderImage(groupKey) && (
                  <img 
                    src={getHeaderImage(groupKey)} 
                    alt={groupBy} 
                    style={{ width: '20px', height: '20px', marginRight: '10px' }}
                  />
                )}
                <h3 style={{ textAlign: 'center', color: '#333', paddingBottom: '8px', margin: '20px 0', fontSize: '0.9em' }}>
                  {groupKey} <span style={{ fontSize: '0.9em', fontWeight: 'normal' }}>{tickets.length}</span>
                </h3>
              </div>

              {/* "+" and "..." buttons */}
              
              <div style={{ marginRight: '30px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                <button style={{ border: 'none', background: 'none', padding: '2px' }}>+</button>
                <button style={{ border: 'none', background: 'none', padding: '0 5px' }}>...</button>
              </div>

            </div>

            {tickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSelect={() => handleSelect(ticket.id)}
                isChecked={selectedTickets.has(ticket.id)}
                userColor={groupBy !== 'userId' ? getUserColor(ticket.userId) : null}
                statusImage={groupBy !== 'status' ? statusImages[ticket.status] : null}
                priorityImage={groupBy !== 'priority' ? priorityImages[ticket.priority] : null}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketApp;
