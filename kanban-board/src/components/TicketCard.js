import React from 'react';

const TicketCard = ({ ticket, onSelect, isChecked, userColor, statusImage, priorityImage }) => {
  // Clean up tag data by checking for empty arrays or empty strings
  const cleanTag = (tag) => {
    if (Array.isArray(tag) && tag.length === 1 && tag[0] === "") {
      return "Feature Request";
    }
    return tag;
  };

  return (
    <div style={{
      backgroundColor: '#ffffff', // White background for the card
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Light shadow for card elevation
      padding: '10px',
      margin: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      position: 'relative',
      justifyContent: 'space-between', // Ensure space between elements
      width: '250px', // Fixed width for consistent size
      height: '150px', // Fixed height for consistent size
    }}>
      {/* Ticket ID */}
      <p style={{ margin: '0', fontWeight: 'bold', fontSize: '0.8em', color: '#555' }}>
        {ticket.id}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '5px' }}>
        {/* Status image beside the title */}
        {statusImage && (
          <img
            src={statusImage}
            alt=""
            style={{
              width: '20px',
              height: '20px',
              marginRight: '8px',
            }}
          />
        )}

        <p style={{
          margin: '0',
          fontSize: '0.8em',
          flex: 1,
          maxWidth: 'calc(100% - 18px)', // Adjusted to prevent overflow
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {ticket.title}
        </p>
      </div>

      {/* Container for priority image and tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          margin: '2px 0', // Increased space between the text and the tag
        }}>
        {/* Priority image */}
        {priorityImage && (
          <img
            src={priorityImage}
            alt=""
            style={{
              width: '20px',
              height: '20px',
              marginRight: '10px',
            }}
          />
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: '#888',
          fontSize: '0.7em',
          border: '1px solid rgba(0, 0, 0, 0.2)', // Decreased opacity for the border
          borderRadius: '4px',
          padding: '4px 8px', // Increased padding for the tag box
          backgroundColor: 'white', // Light background for the tag box
        }}>
          <p style={{ margin: '0', paddingRight: '10px' }}>{cleanTag(ticket.tag)}</p>
        </div>
      </div>

      {/* User color in place of profile photo */}
      <div
        style={{
          backgroundColor: userColor,
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          position: 'absolute',
          right: '15px',
          top: '15px',
        }}
      />
    </div>
  );
};

export default TicketCard;
