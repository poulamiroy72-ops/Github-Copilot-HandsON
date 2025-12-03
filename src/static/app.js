document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayActivities();
  setupFormSubmission();
});

async function fetchAndDisplayActivities() {
  try {
    const response = await fetch("/activities");
    const activities = await response.json();

    displayActivities(activities);
    populateActivityDropdown(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    document.getElementById("activities-list").innerHTML = "<p>Error loading activities.</p>";
  }
}

function displayActivities(activities) {
  const listContainer = document.getElementById("activities-list");
  listContainer.innerHTML = "";

  Object.entries(activities).forEach(([activityName, activityData]) => {
    const card = document.createElement("div");
    card.className = "activity-card";

    // Render participants with delete icon
    let participantsList = "";
    if (activityData.participants.length > 0) {
      participantsList = activityData.participants.map((p) =>
        `<li class="participant-item">
          <span class="participant-email">${p}</span>
          <span class="delete-icon" title="Remove" data-activity="${activityName}" data-email="${p}">&#128465;</span>
        </li>`
      ).join("");
    } else {
      participantsList = '<li class="no-participants">No participants yet</li>';
    }

    card.innerHTML = `
      <h4>${activityName}</h4>
      <p><strong>Description:</strong> ${activityData.description}</p>
      <p><strong>Schedule:</strong> ${activityData.schedule}</p>
      <p><strong>Capacity:</strong> ${activityData.participants.length}/${activityData.max_participants}</p>
      <div class="participants-section">
        <strong>Current Participants:</strong>
        <ul class="participants-list">
          ${participantsList}
        </ul>
      </div>
    `;

    listContainer.appendChild(card);
  });

  // Add event listeners for delete icons
  document.querySelectorAll('.delete-icon').forEach(icon => {
    icon.addEventListener('click', async (e) => {
      const activity = icon.getAttribute('data-activity');
      const email = icon.getAttribute('data-email');
      if (confirm(`Unregister ${email} from ${activity}?`)) {
        try {
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            fetchAndDisplayActivities();
          } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
          }
        } catch (err) {
          alert('Error unregistering participant.');
        }
      }
    });
  });
}

function populateActivityDropdown(activities) {
  const select = document.getElementById("activity");
  // Clear existing options except the first placeholder
  select.length = 1;
  Object.keys(activities).forEach((activityName) => {
    const option = document.createElement("option");
    option.value = activityName;
    option.textContent = activityName;
    select.appendChild(option);
  });
}

function setupFormSubmission() {
  const form = document.getElementById("signup-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const messageDiv = document.getElementById("message");

    try {
      const response = await fetch(`/activities/${activity}/signup?email=${email}`, {
        method: "POST",
      });

      if (response.ok) {
        messageDiv.textContent = `Successfully signed up ${email} for ${activity}!`;
        messageDiv.className = "message success";
        form.reset();
        fetchAndDisplayActivities();
      } else {
        const error = await response.json();
        messageDiv.textContent = `Error: ${error.detail}`;
        messageDiv.className = "message error";
      }
    } catch (error) {
      messageDiv.textContent = "Error signing up. Please try again.";
      messageDiv.className = "message error";
    }
  });
}
