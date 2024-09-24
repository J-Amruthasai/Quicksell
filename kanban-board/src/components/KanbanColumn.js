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
  "Backlog": "/path_to_backlog_image.png"
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

const TicketApp = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState('status');
  const [sortBy, setSortBy] = useState('title');
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
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

  const groupTickets = (tickets) => {
    const grouped = {};
    tickets.forEach(ticket => {
      let key;
      if (groupBy === 'userId') {
        key = getUserName(ticket.userId);
      } else {
        key = groupBy === 'priority' ? priorityNames[ticket[groupBy]] : ticket[groupBy];
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ticket);
    });
    return grouped;
  };

  const sortTickets = (tickets) => {
    return tickets.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return b.priority - a.priority;
    });
  };

  const groupedTickets = groupTickets(tickets);
  const sortedGroupedTickets = Object.entries(groupedTickets).map(([key, group]) => ({
    groupKey: key,
    tickets: sortTickets(group),
  }));

  const getHeaderImage = (key) => {
    if (groupBy === 'status') {
      return statusImages[key];
    }
    if (groupBy === 'userId') {
      const user = users.find(user => user.name === key);
      return user ? getUserColor(user.id) : null; // Return the user color for display
    }
    if (groupBy === 'priority') {
      const priorityLevel = Object.keys(priorityNames).find(p => priorityNames[p] === key);
      return priorityImages[priorityLevel];
    }
    return null;
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', padding: '20px' }}>
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ marginRight: '10px' }}>
          Display
        </button>
        {isDropdownOpen && (
          <div style={{ 
            position: 'absolute', 
            backgroundColor: 'white', 
            border: '1px solid #ccc', 
            padding: '10px', 
            zIndex: 10 
          }}>
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
        overflowX: 'auto',  /* Enables horizontal scrolling */
        gap: '10px', 
        padding: '10px',
        whiteSpace: 'nowrap'  /* Prevents line breaks for tickets */
      }}>
        {sortedGroupedTickets.map(({ groupKey, tickets }) => (
          <div key={groupKey} style={{ minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Display user color or image */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {groupBy === 'userId' && (
                  <div 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%',  /* To make it a circle */
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
                <h3 style={{ textAlign: 'center', color: '#333', paddingBottom: '8px', margin: '10px 0' }}>
                  {groupKey} <span style={{ fontSize: '0.9em', fontWeight: 'normal' }}>{tickets.length}</span>
                </h3>
              </div>

              {/* "+" and "..." buttons */}
              <div>
                <button style={{ border: 'none', background: 'none', padding: '0 5px' }}>+</button>
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

can you style the display button like this and the background of display should be white 