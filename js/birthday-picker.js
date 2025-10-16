// Birthday Picker Component
// A beautiful 3D cake-themed calendar picker for selecting birthdays

class BirthdayPicker {
    constructor(inputElement) {
        this.input = inputElement;
        this.selectedDate = null;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.calendar = null;
        
        this.init();
    }

    init() {
        // Wrap input in container
        const wrapper = document.createElement('div');
        wrapper.className = 'birthday-picker';
        this.input.parentNode.insertBefore(wrapper, this.input);
        wrapper.appendChild(this.input);

        // Add cake icon
        const icon = document.createElement('div');
        icon.className = 'birthday-picker__icon';
        icon.innerHTML = '🎂';
        wrapper.appendChild(icon);

        // Create calendar
        this.createCalendar();

        // Add event listeners
        this.input.addEventListener('click', () => this.toggleCalendar());
        
        // Close calendar when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                this.hideCalendar();
            }
        });
    }

    createCalendar() {
        this.calendar = document.createElement('div');
        this.calendar.className = 'birthday-calendar';
        this.calendar.innerHTML = `
            <div class="calendar-overlay"></div>
            <div class="calendar-header">
                <div class="calendar-nav">
                    <button type="button" class="calendar-nav__btn" id="prevMonth">‹</button>
                </div>
                <div class="calendar-title"></div>
                <div class="calendar-nav">
                    <button type="button" class="calendar-nav__btn" id="nextMonth">›</button>
                </div>
            </div>
            <div class="calendar-selectors">
                <select class="calendar-select" id="monthSelect"></select>
                <div class="calendar-year-selector">
                    <button type="button" class="calendar-year-btn calendar-year-btn--prev" id="prevYear">‹</button>
                    <input type="number" class="calendar-year-input" id="yearInput" min="1924" max="2006" />
                    <button type="button" class="calendar-year-btn calendar-year-btn--next" id="nextYear">›</button>
                </div>
            </div>
            <div class="calendar-weekdays">
                <div class="calendar-weekday">Su</div>
                <div class="calendar-weekday">Mo</div>
                <div class="calendar-weekday">Tu</div>
                <div class="calendar-weekday">We</div>
                <div class="calendar-weekday">Th</div>
                <div class="calendar-weekday">Fr</div>
                <div class="calendar-weekday">Sa</div>
            </div>
            <div class="calendar-days"></div>
            <div class="calendar-footer">
                <button type="button" class="calendar-footer__btn calendar-footer__btn--clear">Clear</button>
                <button type="button" class="calendar-footer__btn calendar-footer__btn--today">Today</button>
            </div>
        `;

        this.input.parentNode.appendChild(this.calendar);

        // Populate month and year selectors
        this.populateSelectors();

        // Attach calendar event listeners
        this.attachCalendarListeners();

        // Render calendar
        this.renderCalendar();
    }

    populateSelectors() {
        const monthSelect = this.calendar.querySelector('#monthSelect');
        const yearInput = this.calendar.querySelector('#yearInput');

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            monthSelect.appendChild(option);
        });

        const currentYear = new Date().getFullYear();
        const minYear = currentYear - 18; // Must be at least 18 years old
        const maxYear = currentYear - 100; // Up to 100 years old
        
        // Set year input attributes
        yearInput.min = maxYear;
        yearInput.max = minYear;
        
        // Set default to 18 years ago
        this.currentYear = minYear;
        this.minYear = minYear;
        this.maxYear = maxYear;
        monthSelect.value = this.currentMonth;
        yearInput.value = this.currentYear;
    }

    attachCalendarListeners() {
        const prevBtn = this.calendar.querySelector('#prevMonth');
        const nextBtn = this.calendar.querySelector('#nextMonth');
        const monthSelect = this.calendar.querySelector('#monthSelect');
        const yearInput = this.calendar.querySelector('#yearInput');
        const prevYearBtn = this.calendar.querySelector('#prevYear');
        const nextYearBtn = this.calendar.querySelector('#nextYear');
        const clearBtn = this.calendar.querySelector('.calendar-footer__btn--clear');
        const todayBtn = this.calendar.querySelector('.calendar-footer__btn--today');

        prevBtn.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
                if (this.currentYear < this.maxYear) {
                    this.currentYear = this.maxYear;
                    this.currentMonth = 0;
                }
            }
            this.renderCalendar();
        });

        nextBtn.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
                if (this.currentYear > this.minYear) {
                    this.currentYear = this.minYear;
                    this.currentMonth = 11;
                }
            }
            this.renderCalendar();
        });

        monthSelect.addEventListener('change', (e) => {
            this.currentMonth = parseInt(e.target.value);
            this.renderCalendar();
        });

        // Year input with validation
        yearInput.addEventListener('input', (e) => {
            let year = parseInt(e.target.value);
            if (isNaN(year)) return;
            
            // Clamp year between min and max
            if (year > this.minYear) year = this.minYear;
            if (year < this.maxYear) year = this.maxYear;
            
            this.currentYear = year;
            e.target.value = year;
            this.renderCalendar();
        });

        yearInput.addEventListener('blur', (e) => {
            // Ensure valid year on blur
            let year = parseInt(e.target.value);
            if (isNaN(year) || year > this.minYear || year < this.maxYear) {
                e.target.value = this.currentYear;
            }
        });

        // Prevent scroll propagation on year input
        yearInput.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const delta = e.deltaY > 0 ? -1 : 1;
            let newYear = this.currentYear + delta;
            
            if (newYear >= this.maxYear && newYear <= this.minYear) {
                this.currentYear = newYear;
                yearInput.value = newYear;
                this.renderCalendar();
            }
        }, { passive: false });

        // Year navigation buttons
        prevYearBtn.addEventListener('click', () => {
            if (this.currentYear > this.maxYear) {
                this.currentYear--;
                this.renderCalendar();
            }
        });

        nextYearBtn.addEventListener('click', () => {
            if (this.currentYear < this.minYear) {
                this.currentYear++;
                this.renderCalendar();
            }
        });

        clearBtn.addEventListener('click', () => {
            this.selectedDate = null;
            this.input.value = '';
            this.input.classList.add('placeholder');
            this.hideCalendar();
        });

        todayBtn.addEventListener('click', () => {
            const today = new Date();
            this.selectDate(today);
            this.hideCalendar();
        });
    }

    renderCalendar() {
        const title = this.calendar.querySelector('.calendar-title');
        const daysContainer = this.calendar.querySelector('.calendar-days');
        const monthSelect = this.calendar.querySelector('#monthSelect');
        const yearInput = this.calendar.querySelector('#yearInput');
        const prevYearBtn = this.calendar.querySelector('#prevYear');
        const nextYearBtn = this.calendar.querySelector('#nextYear');

        // Update title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        title.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        // Update selectors
        monthSelect.value = this.currentMonth;
        yearInput.value = this.currentYear;

        // Update year button states
        prevYearBtn.disabled = this.currentYear <= this.maxYear;
        nextYearBtn.disabled = this.currentYear >= this.minYear;

        // Clear days
        daysContainer.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

        // Add previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const button = this.createDayButton(day, true);
            daysContainer.appendChild(button);
        }

        // Add current month's days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const button = this.createDayButton(day, false);
            
            // Mark today
            if (date.toDateString() === today.toDateString()) {
                button.classList.add('calendar-day--today');
            }

            // Mark selected
            if (this.selectedDate && date.toDateString() === this.selectedDate.toDateString()) {
                button.classList.add('calendar-day--selected');
            }

            button.addEventListener('click', () => {
                this.selectDate(date);
                this.hideCalendar();
            });

            daysContainer.appendChild(button);
        }

        // Add next month's days to fill grid
        const totalCells = daysContainer.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const button = this.createDayButton(day, true);
            daysContainer.appendChild(button);
        }
    }

    createDayButton(day, isOtherMonth) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.textContent = day;
        
        if (isOtherMonth) {
            button.classList.add('calendar-day--other-month');
            button.disabled = true;
        }

        return button;
    }

    selectDate(date) {
        this.selectedDate = date;
        const formatted = this.formatDate(date);
        this.input.value = formatted;
        this.input.classList.remove('placeholder');
        this.renderCalendar();
    }

    formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    showCalendar() {
        this.calendar.classList.add('active');
        this.input.classList.add('active');
    }

    hideCalendar() {
        this.calendar.classList.remove('active');
        this.input.classList.remove('active');
    }

    toggleCalendar() {
        if (this.calendar.classList.contains('active')) {
            this.hideCalendar();
        } else {
            this.showCalendar();
        }
    }
}

// Export for use in other files
window.BirthdayPicker = BirthdayPicker;