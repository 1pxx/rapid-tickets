document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const makeWebhookUrl = 'https://hook.us1.make.com/qsnkib0ulo1e2xwa95uvgd0fzf4gyw6f'; // <-- PASTE YOUR MAKE WEBHOOK URL HERE
    // ---------------------

    const statusContainer = document.getElementById('status-container');
    const statusMessageElement = document.getElementById('status-message');
    const eventDetailsElement = document.getElementById('event-details');
    const ticketIdDisplayElement = document.getElementById('ticket-id-display');

    // Function to update the display
    function updateDisplay(statusClass, message, eventDetails = '', ticketId = '') {
        statusContainer.className = statusClass; // Apply CSS class
        statusMessageElement.textContent = message;
        eventDetailsElement.textContent = eventDetails;
        ticketIdDisplayElement.textContent = ticketId ? `Ticket ID: ${ticketId}` : '';
    }

    // 1. Get Ticket ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('tid'); // Assumes URL is ...?tid=TICKET_ID

    if (!ticketId) {
        updateDisplay('invalid', 'ERROR: No Ticket ID found in URL.');
        return; // Stop if no ID
    }

    updateDisplay('validating', `Validating Ticket...`, '', ticketId);

    // 2. Send Ticket ID to Make Webhook
    fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId: ticketId }), // Send as JSON
    })
    .then(response => {
        if (!response.ok) {
            // Handle HTTP errors (e.g., Make webhook down)
            throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json(); // Parse the JSON response from Make
    })
    .then(data => {
        // 3. Process Response from Make
        console.log('Response from Make:', data); // For debugging

        const eventInfo = data.eventName ? `Event: ${data.eventName}` : '';

        switch (data.status) {
            case 'OK':
                updateDisplay('success', 'Check-in SUCCESSFUL!', eventInfo, ticketId);
                break;
            case 'DUPLICATE':
                updateDisplay('duplicate', 'ALREADY CHECKED IN!', eventInfo, ticketId);
                break;
            case 'INVALID':
            default: // Treat any other status as invalid
                updateDisplay('invalid', 'INVALID TICKET', '', ticketId);
                break;
        }
    })
    .catch(error => {
        // 4. Handle Errors (Network or Parsing)
        console.error('Error during validation:', error);
        updateDisplay('invalid', `ERROR: Could not validate ticket. ${error.message}`);
    });
});