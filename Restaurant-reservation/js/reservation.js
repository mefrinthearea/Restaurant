const TOTAL_TABLES = 20;
const STORAGE_KEY = "trattoria_reservations";
const TIME_SLOTS = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

// Table info: number, seats, description
const TABLE_INFO = [
  { num: 1,  seats: 2,  desc: "Window table" },
  { num: 2,  seats: 2,  desc: "Romantic corner" },
  { num: 3,  seats: 4,  desc: "Near the fireplace" },
  { num: 4,  seats: 4,  desc: "Center room" },
  { num: 5,  seats: 4,  desc: "By the bar" },
  { num: 6,  seats: 6,  desc: "Family table" },
  { num: 7,  seats: 6,  desc: "Booth style" },
  { num: 8,  seats: 8,  desc: "Large group" },
  { num: 9,  seats: 8,  desc: "Birthday corner" },
  { num: 10, seats: 10, desc: "VIP long table" },
  { num: 11, seats: 2,  desc: "Table Outside"},
  { num: 12, seats: 4,  desc: "Outdoor view" },
  { num: 13, seats: 6,  desc: "Near kitchen" },
  { num: 14, seats: 2,  desc: "Bar counter" },
  { num: 15, seats: 2,  desc: "High table" },
  { num: 16, seats: 6,  desc: "Round table" },
  { num: 17, seats: 8,  desc: "Anniversary spot" },
  { num: 18, seats: 4,  desc: "Window seat" },
  { num: 19, seats: 10, desc: "Private area" },
  { num: 20, seats: 6,  desc: "Terrace access" }
];

class ReservationSystem {
  static getBookings() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  static saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }

  static getSlotData(date, time) {
    const bookings = this.getBookings();
    const key = `${date}_${time}`;
    return bookings[key] || [];
  }

  static bookTable(date, time, tableNumber, name, guests, number) {
    const bookings = this.getBookings();
    const key = `${date}_${time}`;
    if (!bookings[key]) bookings[key] = [];

    bookings[key].push({
      table: tableNumber,
      name: name.trim(),
      number: number.trim(),
      guests: parseInt(guests),
      bookedAt: new Date().toLocaleString("en-GB")
    });

    this.saveBookings(bookings);
  }

  static deleteBooking(date, time, index) {
    const bookings = this.getBookings();
    const key = `${date}_${time}`;
    if (bookings[key]) {
      bookings[key].splice(index, 1);
      if (bookings[key].length === 0) delete bookings[key];
      this.saveBookings(bookings);
    }
  }

  // VISITOR SCREEN 
  static renderVisitorScreen(user) {
    const today = new Date().toISOString().split('T')[0];

    return `
      <h5 class="mb-4 text-danger fw-bold">Hello, ${user.name}!</h5>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Date</label>
          <input type="date" id="resDate" class="form-control" min="${today}" value="${today}">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Time</label>
          <select id="resTime" class="form-select">
            ${TIME_SLOTS.map(t => `<option>${t}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Your Name</label>
          <input type="text" id="resName" class="form-control">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Number</label>
          <input type="text" id="resNumber" class="form-control">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Guests</label>
          <input type="number" id="resGuests" class="form-control" min="1" max="10" value="2">
        </div>
      </div>

      <h6 class="mt-4 mb-3 fw-bold text-success">Choose Your Table</h6>
      <div id="tablesGrid" class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4"></div>

      <div class="alert alert-light border mt-4" id="availabilityInfo">
        Select date & time to see available tables
      </div>

      <div class="d-flex justify-content-between mt-4">
        <button id="visitorLogout" class="btn btn-outline-secondary">Logout</button>
        <button id="bookTableBtn" class="btn btn-danger btn-lg px-5 shadow" disabled>
          Book Selected Table
        </button>
      </div>
    `;
  }

  static renderTablesGrid() {
    const date = document.getElementById('resDate')?.value;
    const time = document.getElementById('resTime')?.value;
    const grid = document.getElementById('tablesGrid');
    const info = document.getElementById('availabilityInfo');
    const btn = document.getElementById('bookTableBtn');

    if (!date || !time) {
      grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">Please select date and time</div>`;
      info.innerHTML = 'Select date and time above';
      btn.disabled = true;
      return;
    }

    const bookings = this.getSlotData(date, time);
    const bookedTables = bookings.map(b => b.table);

    let html = '';
    TABLE_INFO.forEach(t => {
      const isBooked = bookedTables.includes(t.num);
      const booking = bookings.find(b => b.table === t.num);

      html += `
        <div class="col">
          <div class="table-card rounded-4 border shadow-sm text-center p-3 position-relative
                      ${isBooked ? 'bg-danger text-white' : 'bg-light border-success hover-shadow'}
                      ${!isBooked ? 'cursor-pointer' : ''}"
               data-table="${t.num}" style="transition: all 0.3s;">
            <div class="fw-bold fs-5">Table ${t.num}</div>
            <div class="small opacity-75">${t.seats} seats</div>
            <div class="badge bg-white text-dark mt-2 px-3 py-1 rounded-pill small">
              ${t.desc}
            </div>
            ${isBooked ? `
              <div class="mt-2">
                <strong>${booking.name}</strong><br>
                <small>${booking.guests} guests</small>
              </div>` : '<div class="mt-3 text-success fw-bold">AVAILABLE</div>'}
          </div>
        </div>`;
    });

    grid.innerHTML = html;

    const free = TOTAL_TABLES - bookedTables.length;
    info.innerHTML = `<strong class="text-success">${free} tables free</strong> — click any table to select`;

    // Click to select
    grid.querySelectorAll('.table-card:not(.bg-danger)').forEach(card => {
      card.onclick = () => {
        grid.querySelectorAll('.table-card').forEach(c => {
          c.classList.remove('ring-4', 'ring-warning', 'shadow-lg');
          c.style.transform = '';
        });
        card.classList.add('ring-4', 'ring-warning', 'shadow-lg');
        card.style.transform = 'scale(1.06)';
        btn.disabled = false;
        btn.dataset.selectedTable = card.dataset.table;
      };
    });
  }

  // ADMIN SCREEN 
  static renderAdminScreen() {
    const bookings = this.getBookings();
    let rows = '';

    const start = new Date();
    for (let i = 0; i < 15; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      TIME_SLOTS.forEach(time => {
        const slot = bookings[`${dateStr}_${time}`] || [];
        slot.forEach((b, idx) => {
          const table = TABLE_INFO.find(t => t.num === b.table) || { seats: '?', desc: '' };
          rows += `
            <tr>
              <td>${dateStr}</td>
              <td>${time}</td>
              <td><strong>Table ${b.table}</strong><br><small>${table.seats} seats – ${table.desc}</small></td>
              <td>${b.name}</td>
              <td>${b.guests} guests</td>
              <td><small>${b.bookedAt}</small></td>
              <td><small>${b.number}</small></td>
              <td>
                <button class="btn btn-sm btn-outline-danger delete-btn"
                        data-date="${dateStr}" data-time="${time}" data-idx="${idx}">
                  Delete
                </button>
              </td>
            </tr>`;
        });
      });
    }

    const empty = rows === '' ? '<tr><td colspan="7" class="text-center py-5 text-muted">No reservations yet</td></tr>' : '';

    return `
      <h5 class="mb-4 text-danger fw-bold">Admin Panel – Manage Reservations</h5>
      <div class="d-flex justify-content-between mb-3">
        <button id="refreshAdmin" class="btn btn-success">Refresh</button>
        <button id="adminLogout" class="btn btn-outline-secondary">Logout</button>
      </div>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-dark">
            <tr>
              <th>Date</th><th>Time</th><th>Table</th><th>Name</th><th>Guests</th><th>Booked</th><th>Number</th><th>Action</th>
            </tr>
          </thead>
          <tbody>${rows || empty}</tbody>
        </table>
      </div>
    `;
  }

  // ==================== MAIN INIT ====================
  static init() {
    const modalBody = document.getElementById('reservationModalBody');
    if (!modalBody) return;

    const user = AuthManager.getCurrentUser();

    if (!user) {
      // Login screen
      modalBody.innerHTML = `
        <div class="text-center py-5">
          <h4 class="text-danger">Welcome Back</h4>
          <div class="w-75 mx-auto">
            <input type="text" id="loginUsername" class="form-control mb-3" placeholder="Username">
            <input type="password" id="loginPassword" class="form-control mb-4" placeholder="Password">
            <button id="loginSubmit" class="btn btn-danger btn-lg px-5">Login</button>
          </div>
          <p class="mt-4 small text-muted">
            Demo:<br><strong>user</strong>/1234   |   <strong>admin</strong>/admin
          </p>
        </div>`;
      document.getElementById('loginSubmit').onclick = () => {
        const u = document.getElementById('loginUsername').value.trim();
        const p = document.getElementById('loginPassword').value;
        if (AuthManager.login(u, p)) this.init();
        else alert('Wrong credentials!');
      };

    } else if (AuthManager.isAdmin()) {
      modalBody.innerHTML = this.renderAdminScreen();
      document.getElementById('refreshAdmin').onclick = () => this.init();
      document.getElementById('adminLogout').onclick = () => {
        AuthManager.logout();
        this.init();
      };
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => {
          if (confirm('Delete this reservation?')) {
            this.deleteBooking(btn.dataset.date, btn.dataset.time, btn.dataset.idx);
            this.init();
          }
        };
      });

    } else {
      // Visitor
      modalBody.innerHTML = this.renderVisitorScreen(user);

      const refresh = () => this.renderTablesGrid();
      document.getElementById('resDate').onchange = refresh;
      document.getElementById('resTime').onchange = refresh;
      refresh();

      document.getElementById('visitorLogout').onclick = () => {
        AuthManager.logout();
        this.init();
      };

      document.getElementById('bookTableBtn').onclick = () => {
        const selected = document.querySelector('.ring-warning');
        if (!selected) return alert('Please select a table first');

        const tableNum = parseInt(selected.dataset.table);
        const table = TABLE_INFO.find(t => t.num === tableNum);
        const guests = parseInt(document.getElementById('resGuests').value);

        if (guests > table.seats) {
          return alert(`Table ${tableNum} only fits ${table.seats} people!`);
        }

        const date = document.getElementById('resDate').value;
        const time = document.getElementById('resTime').value;
        const name = document.getElementById('resName').value.trim() || user.name;
        const number = document.getElementById('resNumber').value.trim() || user.number;

        this.bookTable(date, time, tableNum, name, guests, number);
        alert(`Table ${tableNum} booked successfully!\n${date} at ${time}`);
        refresh();
      };
    }
  }
}

// Start when modal opens
document.getElementById('reservationModal')?.addEventListener('shown.bs.modal', () => {
  ReservationSystem.init();
});
