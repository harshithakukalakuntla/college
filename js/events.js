/**
 * events.js
 * Handles event catalog listing, search, category filtering, and sorting.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // If on explore events page or home page
  const eventsGrid = document.getElementById('events-grid');
  if (eventsGrid) {
    await initEventsCatalog();
  }

  // If featured events grid exists (on index.html)
  const featuredGrid = document.getElementById('featured-events-grid');
  if (featuredGrid) {
    await renderFeaturedEvents();
  }
});

let allEventsCache = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'date-asc';

async function initEventsCatalog() {
  try {
    const res = await window.api.events.getAll();
    allEventsCache = res.data || [];
    setupFilterEvents();
    renderFilteredEvents();
  } catch (err) {
    console.error('Error fetching events:', err);
    const container = document.getElementById('events-grid');
    if (container) {
      container.innerHTML = `<div class="empty-state"><h3>Unable to load events</h3><p>${err.message}</p></div>`;
    }
  }
}

function setupFilterEvents() {
  // Search Input
  const searchInput = document.getElementById('events-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      renderFilteredEvents();
    });
  }

  // Category Filter Chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.getAttribute('data-category') || 'all';
      renderFilteredEvents();
    });
  });

  // Sort Dropdown
  const sortSelect = document.getElementById('events-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderFilteredEvents();
    });
  }
}

function renderFilteredEvents() {
  const container = document.getElementById('events-grid');
  const countBadge = document.getElementById('events-count-badge');
  if (!container) return;

  let filtered = [...allEventsCache];

  // Category Filter
  if (currentCategory !== 'all') {
    filtered = filtered.filter(
      (e) => e.category.toLowerCase() === currentCategory.toLowerCase()
    );
  }

  // Search Filter
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Sorting
  if (currentSort === 'date-asc') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (currentSort === 'date-desc') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (currentSort === 'seats-desc') {
    filtered.sort((a, b) => (b.registeredSeats || 0) - (a.registeredSeats || 0));
  } else if (currentSort === 'title-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Event${filtered.length === 1 ? '' : 's'} Found`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <span class="empty-state-icon">🔍</span>
        <h3>No matching events found</h3>
        <p>Try adjusting your search keywords or switching category filters.</p>
        <button class="btn btn-outline-primary btn-sm" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((event) => createEventCardHtml(event)).join('');
}

function resetFilters() {
  const searchInput = document.getElementById('events-search-input');
  if (searchInput) searchInput.value = '';
  currentSearch = '';
  currentCategory = 'all';

  document.querySelectorAll('.filter-chip').forEach((c) => {
    c.classList.remove('active');
    if (c.getAttribute('data-category') === 'all') c.classList.add('active');
  });

  renderFilteredEvents();
}

/**
 * Creates HTML string for a single Event Card
 */
function createEventCardHtml(event) {
  const dateObj = new Date(event.date);
  const monthStr = dateObj.toLocaleString('en-US', { month: 'short' });
  const dayStr = dateObj.getDate();
  const seatsLeft = Math.max(0, event.totalSeats - (event.registeredSeats || 0));
  const percentFilled = Math.min(100, Math.round(((event.registeredSeats || 0) / event.totalSeats) * 100));

  const isSoldOut = seatsLeft <= 0;

  return `
    <div class="event-card animate-fade-in">
      <div class="event-card-img-wrap">
        <img src="${event.image}" alt="${event.title}" class="event-card-img" loading="lazy" />
        <div class="event-card-top-badges">
          ${window.main.getCategoryBadge(event.category)}
          <div class="event-date-pill">
            <span class="event-date-month">${monthStr}</span>
            <span class="event-date-day">${dayStr}</span>
          </div>
        </div>
      </div>

      <div class="event-card-body">
        <h3 class="event-card-title">
          <a href="event-details.html?id=${event.id}">${event.title}</a>
        </h3>
        <p class="event-card-desc">${event.description}</p>

        <div class="event-card-meta">
          <div class="event-meta-item">
            <span>📍</span> <span>${event.venue}</span>
          </div>
          <div class="event-meta-item">
            <span>⏰</span> <span>${event.time}</span>
          </div>

          <div class="event-seat-progress">
            <div class="seat-progress-label">
              <span class="text-muted">Seats: <strong>${event.registeredSeats || 0}/${event.totalSeats}</strong></span>
              <span class="${isSoldOut ? 'text-danger' : 'text-success'} font-bold">
                ${isSoldOut ? 'Sold Out' : `${seatsLeft} Left`}
              </span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percentFilled}%; ${isSoldOut ? 'background: var(--danger);' : ''}"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="event-card-footer">
        <span class="event-price-tag">${event.price || 'Free'}</span>
        <a href="event-details.html?id=${event.id}" class="btn btn-sm btn-primary">
          View Details &rarr;
        </a>
      </div>
    </div>
  `;
}

/**
 * Render top featured events on index.html
 */
async function renderFeaturedEvents() {
  const container = document.getElementById('featured-events-grid');
  if (!container) return;

  try {
    const res = await window.api.events.getAll();
    const events = (res.data || []).slice(0, 3);

    if (events.length === 0) {
      container.innerHTML = '<p class="text-center">No upcoming events currently scheduled.</p>';
      return;
    }

    container.innerHTML = events.map((event) => createEventCardHtml(event)).join('');
  } catch (err) {
    console.error('Error fetching featured events:', err);
  }
}

window.resetFilters = resetFilters;
