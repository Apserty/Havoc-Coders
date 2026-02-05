// js/main.js
// Initialize floating shapes animation
function animateFloatingShapes() {
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
        // Randomize initial positions
        shape.style.left = `${Math.random() * 80 + 5}%`;
        shape.style.top = `${Math.random() * 80 + 5}%`;
        
        // Randomize animation duration
        const duration = 20 + Math.random() * 20;
        shape.style.animationDuration = `${duration}s`;
        
        // Randomize animation direction
        if (Math.random() > 0.5) {
            shape.style.animationDirection = 'reverse';
        }
    });
}

// Mouse movement effects
function initMouseEffects() {
    const follower = document.querySelector('.mouse-follower');
    if (!follower) return;
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Update mouse follower
        follower.style.left = `${mouseX - 15}px`;
        follower.style.top = `${mouseY - 15}px`;
        
        // Interactive hover effects for job cards
        const jobCards = document.querySelectorAll('.job-card');
        jobCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;
            
            const distanceX = mouseX - cardX;
            const distanceY = mouseY - cardY;
            
            const rotateY = distanceX / 50;
            const rotateX = -distanceY / 50;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
    });
}

// Scroll effects for background
function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const bg = document.querySelector('.animated-bg');
        if (bg) {
            bg.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        
        // Texture animation with scroll
        const texture = document.querySelector('.texture-overlay');
        if (texture) {
            texture.style.backgroundPosition = `${scrolled * 0.2}px ${scrolled * 0.2}px, ${scrolled * 0.1}px ${scrolled * 0.1}px`;
        }
    });
}

// Apply button interactions
function initApplyButtons() {
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Check if user is logged in
            const currentUser = JSON.parse(localStorage.getItem('earnkart_user'));
            if (!currentUser) {
                alert('Please login to apply for jobs');
                return;
            }
            
            this.innerHTML = '<i class="fas fa-check"></i> Applied!';
            this.style.background = 'var(--secondary)';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-paper-plane"></i> Apply Now';
                this.style.background = '';
                this.disabled = false;
            }, 2000);
        });
    });
}

// Set active navigation based on current page (supports in-page `inbox` via hash)
function setActiveNavigation() {
  const path = window.location.pathname; // e.g. "/", "/jobs/", "/post-job/"
  const hash = window.location.hash;
  const navButtons = document.querySelectorAll('.nav-btn, .nav-link');

  navButtons.forEach(btn => {
    btn.classList.remove('active');

    const href = btn.getAttribute('href') || '';
    // If you're using in-page inbox
    if (hash === '#inbox' && href.includes('#inbox')) {
      btn.classList.add('active');
      return;
    }

    // Mark active if href matches current path
    if (href && href !== '#' && path === href) {
      btn.classList.add('active');
    }

    // Home path special-case
    if (path === '/' && (href === '/' || href.includes('index'))) {
      btn.classList.add('active');
    }
  });
}


// Show/hide homepage sections (home vs embedded inbox)
function showSection(page) {
    const hero = document.querySelector('.hero');
    const featured = document.getElementById('featuredJobsSection');
    const inbox = document.getElementById('inboxSection');

    if (page === 'inbox') {
        if (hero) hero.style.display = 'none';
        if (featured) featured.style.display = 'none';
        if (inbox) {
            inbox.style.display = '';
            // CSS active class for transition
            requestAnimationFrame(() => inbox.classList.add('active'));
            inbox.setAttribute('aria-hidden', 'false');
            inbox.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        if (hero) hero.style.display = '';
        if (featured) featured.style.display = '';
        if (inbox) {
            inbox.classList.remove('active');
            inbox.setAttribute('aria-hidden', 'true');
            setTimeout(() => { if (inbox) inbox.style.display = 'none'; }, 350);
        }
    }

    // keep nav active state in sync
    setActiveNavigation();
}

// Attach handlers to nav buttons for in-page navigation (only intercepts home/inbox on index)
function initPageNavigation() {
    const navBtns = document.querySelectorAll('header .page-nav a, header .nav-menu a');

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // determine page from data-page or href
            let page = btn.dataset.page || '';
            if (!page) {
                const href = btn.getAttribute('href') || '';
                if (href.includes('#inbox')) page = 'inbox';
                else page = (href.split('/').filter(Boolean).pop() || '').replace('.html', '') || 'home';
            }

            // intercept in-page navigation when on the homepage
            if (page === 'home' || page === 'inbox') {
                // allow normal navigation if we're on a different HTML page
                if (window.location.pathname !== '/') return;
                e.preventDefault();
                if (page === 'home') {
                    history.replaceState(null, '', '/');
                } else if (page === 'inbox') {
                    history.replaceState(null, '', '/#inbox');
                }
                showSection(page);
            }
        });
    });

    // show inbox if URL contains hash on load
    if (location.hash === '#inbox') showSection('inbox');
}

// Initialize user authentication UI
function initAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (!authButtons || !userProfile) return;
    
    const currentUser = JSON.parse(localStorage.getItem('earnkart_user'));
    
    if (currentUser) {
        // User is logged in
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        if (userName) userName.textContent = currentUser.name;
        if (userAvatar) userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    } else {
        // User is not logged in
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}

// ---- About: dynamic impact counters ----
function _formatCurrencyShort(n) {
    if (n >= 1e7) return `₹${(n/1e7).toFixed((n/1e7) >= 10 ? 0 : 1)}Cr`;
    if (n >= 1e5) return `₹${(n/1e5).toFixed((n/1e5) >= 10 ? 0 : 1)}L`;
    if (n >= 1000) return `₹${(n/1000).toFixed((n/1000) >= 10 ? 0 : 1)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
}

function _animateCount(el, to, opts = {}) {
    const duration = opts.duration || 900;
    const start = performance.now();
    const from = Number(opts.from || 0);
    const formatter = opts.formatter || (v => v.toLocaleString('en-IN'));

    return new Promise(resolve => {
        function step(now) {
            const t = Math.min(1, (now - start) / duration);
            const val = Math.round(from + (to - from) * t);
            el.textContent = formatter(val);
            if (t < 1) requestAnimationFrame(step);
            else {
                if (opts.suffix) el.textContent += opts.suffix;
                el.classList.add('animated');
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}

function initImpactSection() {
    const jobsEl = document.getElementById('impact-jobs');
    if (!jobsEl) return; // not on this page

    const workersEl = document.getElementById('impact-workers');
    const earnedEl = document.getElementById('impact-earned');
    const citiesEl = document.getElementById('impact-cities');

    const data = {
        jobsPosted: Number(jobsEl.dataset.value) || 0,
        workersRegistered: Number(workersEl?.dataset.value) || 0,
        earnedByWorkers: Number(earnedEl?.dataset.value) || 0,
        citiesServed: Number(citiesEl?.dataset.value) || 0
    };

    const animateNow = () => {
        _animateCount(jobsEl, data.jobsPosted, { duration: 900, formatter: v => v.toLocaleString('en-IN'), suffix: '+' });
        _animateCount(workersEl, data.workersRegistered, { duration: 900, formatter: v => v.toLocaleString('en-IN'), suffix: '+' });
        _animateCount(earnedEl, data.earnedByWorkers, { duration: 1200, formatter: v => _formatCurrencyShort(v), suffix: '+' });
        _animateCount(citiesEl, data.citiesServed, { duration: 800, formatter: v => v.toString(), suffix: '+' });

        // accessibility
        [jobsEl, workersEl, earnedEl, citiesEl].forEach(el => el && el.setAttribute('aria-live', 'polite'));
    };

    // If already visible, animate; otherwise animate when scrolled into view
    const rect = jobsEl.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        animateNow();
    } else {
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    animateNow();
                    o.disconnect();
                }
            });
        }, { threshold: 0.2 });
        obs.observe(jobsEl);
    }
}

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animateFloatingShapes();
    initMouseEffects();
    initScrollEffects();
    initApplyButtons();
    setActiveNavigation();
    initPageNavigation();
    initAuthUI();
    initImpactSection();
    
    // Set current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// inbox-script.js

document.addEventListener('DOMContentLoaded', function() {
    // ====== DATA STORAGE ======
    let currentUser = JSON.parse(localStorage.getItem('earnkart_user')) || {
        name: 'Aswath',
        email: 'aswatharu2407@gmail.com',
        type: 'employee' // 'employee' or 'employer'
    };
    
    let applicationsData = {
        employeeApplications: [
            {
                id: 1,
                jobTitle: "Harvesting Helper",
                employerName: "Farm Fresh Co.",
                employerInitials: "FF",
                status: "Under Review",
                appliedDate: "2025-03-10",
                expectedResponse: "Within 3 days",
                timeAgo: "2 days ago",
                unread: true
            },
            {
                id: 2,
                jobTitle: "Carpentry Assistant",
                employerName: "Woodcraft Solutions",
                employerInitials: "WS",
                status: "Shortlisted",
                appliedDate: "2025-03-07",
                nextStep: "Interview scheduled for March 15",
                timeAgo: "5 days ago",
                unread: false
            },
            {
                id: 3,
                jobTitle: "Full Stack Developer",
                employerName: "College Project",
                employerInitials: "CP",
                status: "Pending",
                appliedDate: "2025-03-05",
                expectedResponse: "This week",
                timeAgo: "1 week ago",
                unread: false
            }
        ],
        
        acceptedJobs: [
            {
                id: 1,
                jobTitle: "Harvesting Vegetables",
                employerName: "Local Farm",
                employerInitials: "LF",
                startDate: "March 15, 2025",
                duration: "2 weeks",
                pay: "₹560 per day",
                location: "Coimbatore",
                schedule: "9:00 AM - 4:00 PM",
                benefits: "Lunch Provided",
                requirements: "Sickle Experience Required",
                timeAgo: "Yesterday",
                showDetails: false
            },
            {
                id: 2,
                jobTitle: "House Painter",
                employerName: "Home Services",
                employerInitials: "HS",
                startDate: "March 20, 2025",
                duration: "3 days",
                pay: "₹800 per day",
                location: "North Chennai",
                schedule: "8:00 AM - 5:00 PM",
                benefits: "Materials Provided",
                requirements: "Painting Experience",
                timeAgo: "3 days ago",
                showDetails: false
            }
        ],
        
        employerApplicants: [
            {
                id: 1,
                applicantName: "Aswath",
                applicantInitials: "A",
                jobTitle: "Harvesting Helper",
                experience: "2 years in farming",
                skills: ["Farming", "Manual Labor", "Gardening"],
                availability: "Immediate",
                expectedPay: "₹200/day",
                timeAgo: "Today",
                unread: true
            },
            {
                id: 2,
                applicantName: "Ravi Kumar",
                applicantInitials: "RK",
                jobTitle: "Carpentry Assistant",
                experience: "3 years carpentry",
                skills: ["Carpentry", "Woodworking", "Tools"],
                availability: "Next week",
                expectedPay: "₹350/day",
                timeAgo: "2 days ago",
                unread: false
            },
            {
                id: 3,
                applicantName: "Priya Sharma",
                applicantInitials: "PS",
                jobTitle: "House Painter",
                experience: "1 year painting",
                skills: ["Painting", "Color Mixing", "Surface Prep"],
                availability: "Flexible",
                expectedPay: "₹700/day",
                timeAgo: "3 days ago",
                unread: true
            }
        ],
        
        employerProfiles: [
            {
                id: 1,
                name: "Farm Fresh Co.",
                initials: "FF",
                type: "Agricultural Company",
                rating: 4.3,
                jobsPosted: 24,
                employeesHired: 156,
                responseRate: "95%",
                verified: ["ID", "Phone", "Business"],
                description: "Leading agricultural company with 10+ years experience in organic farming.",
                skills: ["Farming", "Harvesting", "Organic", "Agriculture"],
                location: "Multiple locations across Tamil Nadu",
                memberSince: "2018"
            },
            {
                id: 2,
                name: "Woodcraft Solutions",
                initials: "WS",
                type: "Carpentry Workshop",
                rating: 4.8,
                jobsPosted: 12,
                employeesHired: 48,
                responseRate: "98%",
                verified: ["ID", "Phone", "Business"],
                description: "Professional carpentry and woodworking workshop specializing in custom furniture.",
                skills: ["Carpentry", "Woodworking", "Furniture", "Craftsmanship"],
                location: "District Y Industrial Area",
                memberSince: "2020"
            },
            {
                id: 3,
                name: "Local Farm",
                initials: "LF",
                type: "Family Farm",
                rating: 4.5,
                jobsPosted: 8,
                employeesHired: 32,
                responseRate: "90%",
                verified: ["ID", "Phone"],
                description: "Family-owned farm practicing sustainable agriculture for over 20 years.",
                skills: ["Farming", "Vegetables", "Sustainable", "Local"],
                location: "Coimbatore outskirts",
                memberSince: "2015"
            }
        ]
    };
    
    // ====== DOM ELEMENTS ======
    const userTypeBtns = document.querySelectorAll('.user-type-btn');
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const applicationsList = document.getElementById('applications-list');
    const acceptedJobsList = document.getElementById('accepted-jobs-list');
    const applicantsList = document.getElementById('applicants-list');
    const employerProfilesList = document.getElementById('employer-profiles-list');
    const emptyState = document.getElementById('empty-state');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const employerProfileDetails = document.getElementById('employerProfileDetails');
    const browseJobsBtn = document.getElementById('browse-jobs-btn');
    
    // ====== INITIALIZATION ======
    function init() {
        // Update auth UI
        updateAuthUI();
        
        // Set initial user type
        setUserType(currentUser.type || 'employee');
        
        // Load initial data
        loadApplications();
        loadAcceptedJobs();
        loadEmployerApplicants();
        loadEmployerProfiles();
        
        // Setup event listeners
        setupEventListeners();

        // Safety: ensure modal is hidden and cleared on initialization (prevents accidental empty popup)
        try {
            if (profileModal) {
                profileModal.style.display = 'none';
            }
            if (employerProfileDetails) {
                employerProfileDetails.innerHTML = '';
            }
        } catch (err) {
            console.warn('Could not reset profile modal during init', err);
        }
        
        // Animate floating shapes
        animateFloatingShapes();
        
        // Setup mouse effects
        setupMouseEffects();
    }
    
    // ====== AUTH UI ======
    function updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (currentUser && authButtons && userProfile) {
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
            if (userName) userName.textContent = currentUser.name;
            if (userAvatar) userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        }
    }
    
    // ====== USER TYPE SWITCHING ======
    function setUserType(type) {
        // Update button states
        userTypeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.user === type) {
                btn.classList.add('active');
            }
        });
        
        // Update current user type
        currentUser.type = type;
        localStorage.setItem('earnkart_user', JSON.stringify(currentUser));
        
        // Update UI based on user type
        if (type === 'employer') {
            // Show employer-specific tabs
            updateSidebarForEmployer();
            switchToTab('employer-view');
        } else {
            // Show employee-specific tabs
            updateSidebarForEmployee();
            switchToTab('applications');
        }
    }
    
    function updateSidebarForEmployee() {
        const applicationsTab = document.querySelector('.sidebar-tab[data-tab="applications"]');
        const acceptedTab = document.querySelector('.sidebar-tab[data-tab="accepted"]');
        const employerViewTab = document.querySelector('.sidebar-tab[data-tab="employer-view"]');
        
        if (applicationsTab) applicationsTab.style.display = 'flex';
        if (acceptedTab) acceptedTab.style.display = 'flex';
        if (employerViewTab) employerViewTab.style.display = 'none';
        
        // Update badge counts
        updateBadgeCounts();
    }
    
    function updateSidebarForEmployer() {
        const applicationsTab = document.querySelector('.sidebar-tab[data-tab="applications"]');
        const acceptedTab = document.querySelector('.sidebar-tab[data-tab="accepted"]');
        const employerViewTab = document.querySelector('.sidebar-tab[data-tab="employer-view"]');
        
        if (applicationsTab) applicationsTab.style.display = 'none';
        if (acceptedTab) acceptedTab.style.display = 'none';
        if (employerViewTab) employerViewTab.style.display = 'flex';
        
        // Update badge counts
        updateBadgeCounts();
    }
    
    // ====== TAB SWITCHING ======
    function switchToTab(tabName) {
        // Update sidebar tabs
        sidebarTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update content tabs
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });
        
        // Show/hide empty state
        updateEmptyState();
    }
    
    // ====== DATA LOADING FUNCTIONS ======
    function loadApplications() {
        if (!applicationsList) return;
        
        applicationsList.innerHTML = '';
        
        if (applicationsData.employeeApplications.length === 0) {
            applicationsList.innerHTML = '<p class="empty-message">No applications found.</p>';
            return;
        }
        
        applicationsData.employeeApplications.forEach(app => {
            const appCard = createApplicationCard(app);
            applicationsList.appendChild(appCard);
        });
        
        // Update badge count
        const unreadCount = applicationsData.employeeApplications.filter(app => app.unread).length;
        updateBadge('applications-count', unreadCount);
    }
    
    function loadAcceptedJobs() {
        if (!acceptedJobsList) return;
        
        acceptedJobsList.innerHTML = '';
        
        if (applicationsData.acceptedJobs.length === 0) {
            acceptedJobsList.innerHTML = '<p class="empty-message">No accepted jobs found.</p>';
            return;
        }
        
        applicationsData.acceptedJobs.forEach(job => {
            const jobCard = createAcceptedJobCard(job);
            acceptedJobsList.appendChild(jobCard);
        });
        
        // Update badge count
        updateBadge('accepted-count', applicationsData.acceptedJobs.length);
    }
    
    function loadEmployerApplicants() {
        if (!applicantsList) return;
        
        applicantsList.innerHTML = '';
        
        if (applicationsData.employerApplicants.length === 0) {
            applicantsList.innerHTML = '<p class="empty-message">No applicants found.</p>';
            return;
        }
        
        applicationsData.employerApplicants.forEach(applicant => {
            const applicantCard = createApplicantCard(applicant);
            applicantsList.appendChild(applicantCard);
        });
        
        // Update badge count
        const unreadCount = applicationsData.employerApplicants.filter(app => app.unread).length;
        updateBadge('applicants-count', unreadCount);
    }
    
    function loadEmployerProfiles() {
        if (!employerProfilesList) return;
        
        employerProfilesList.innerHTML = '';
        
        if (applicationsData.employerProfiles.length === 0) {
            employerProfilesList.innerHTML = '<p class="empty-message">No employer profiles found.</p>';
            return;
        }
        
        applicationsData.employerProfiles.forEach(profile => {
            const profileCard = createEmployerProfileCard(profile);
            employerProfilesList.appendChild(profileCard);
        });
        
        // Update badge count
        updateBadge('profiles-count', applicationsData.employerProfiles.length);
    }
    
    // ====== CARD CREATION FUNCTIONS ======
    function createApplicationCard(application) {
        const card = document.createElement('div');
        card.className = `message-card ${application.unread ? 'unread' : ''}`;
        card.dataset.id = application.id;
        
        card.innerHTML = `
            <div class="message-header">
                <div class="message-sender">
                    <div class="sender-avatar">${application.employerInitials}</div>
                    <div class="sender-info">
                        <h4>${application.employerName}</h4>
                        <p>${application.jobTitle}</p>
                    </div>
                </div>
                <div class="message-time">${application.timeAgo}</div>
            </div>
            <div class="message-preview">
                <strong>Status:</strong> ${application.status}<br>
                <strong>Applied On:</strong> ${application.appliedDate}<br>
                ${application.nextStep ? `<strong>Next Step:</strong> ${application.nextStep}<br>` : ''}
                ${application.expectedResponse ? `<strong>Expected Response:</strong> ${application.expectedResponse}` : ''}
            </div>
            <div class="message-actions">
                <button class="action-btn view-profile-btn" data-employer-id="${application.id}">
                    <i class="fas fa-eye"></i> View Employer Profile
                </button>
            </div>
        `;
        
        return card;
    }
    
    function createAcceptedJobCard(job) {
        const card = document.createElement('div');
        card.className = 'message-card';
        card.dataset.id = job.id;
        
        card.innerHTML = `
            <div class="message-header">
                <div class="message-sender">
                    <div class="sender-avatar">${job.employerInitials}</div>
                    <div class="sender-info">
                        <h4>${job.employerName}</h4>
                        <p>${job.jobTitle}</p>
                    </div>
                </div>
                <div class="message-time">${job.timeAgo}</div>
            </div>
            <div class="message-preview">
                <strong>Congratulations!</strong> Your application has been accepted.<br>
                <strong>Start Date:</strong> ${job.startDate}<br>
                <strong>Duration:</strong> ${job.duration}<br>
                <strong>Pay:</strong> ${job.pay}
            </div>
            ${job.showDetails ? `
                <div class="job-details">
                    <h3><i class="fas fa-info-circle"></i> Job Details</h3>
                    <div class="job-info">
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${job.location}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>${job.schedule}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-utensils"></i>
                            <span>${job.benefits}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-tools"></i>
                            <span>${job.requirements}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
            <div class="message-actions">
                <button class="action-btn accept-btn toggle-details-btn" data-job-id="${job.id}">
                    <i class="fas fa-info-circle"></i> ${job.showDetails ? 'Hide Details' : 'View Details'}
                </button>
                <button class="action-btn view-profile-btn" data-employer-id="${job.id}">
                    <i class="fas fa-eye"></i> Review Employer
                </button>
                <button class="action-btn accept-btn confirm-btn" data-job-id="${job.id}">
                    <i class="fas fa-check"></i> Confirm Acceptance
                </button>
            </div>
        `;
        
        return card;
    }
    
    function createApplicantCard(applicant) {
        const card = document.createElement('div');
        card.className = `message-card ${applicant.unread ? 'unread' : ''}`;
        card.dataset.id = applicant.id;
        
        card.innerHTML = `
            <div class="message-header">
                <div class="message-sender">
                    <div class="sender-avatar">${applicant.applicantInitials}</div>
                    <div class="sender-info">
                        <h4>${applicant.applicantName}</h4>
                        <p>Applied for ${applicant.jobTitle}</p>
                    </div>
                </div>
                <div class="message-time">${applicant.timeAgo}</div>
            </div>
            <div class="message-preview">
                <strong>Experience:</strong> ${applicant.experience}<br>
                <strong>Skills:</strong> ${applicant.skills.join(', ')}<br>
                <strong>Availability:</strong> ${applicant.availability}<br>
                <strong>Expected Pay:</strong> ${applicant.expectedPay}
            </div>
            <div class="message-actions">
                <button class="action-btn accept-btn" data-applicant-id="${applicant.id}">
                    <i class="fas fa-check"></i> Accept Application
                </button>
                <button class="action-btn reject-btn" data-applicant-id="${applicant.id}">
                    <i class="fas fa-times"></i> Reject
                </button>
                <button class="action-btn view-profile-btn">
                    <i class="fas fa-eye"></i> View Profile
                </button>
            </div>
        `;
        
        return card;
    }
    
    function createEmployerProfileCard(profile) {
        const card = document.createElement('div');
        card.className = 'employer-profile-card';
        card.dataset.id = profile.id;
        
        // Create stars for rating
        const stars = getStarRating(profile.rating);
        
        // Create verified badges
        const verifiedBadges = profile.verified.map(v => 
            `<span class="verified-badge"><i class="fas fa-check-circle"></i> ${v} Verified</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="profile-card-header">
                <div class="profile-avatar-large">${profile.initials}</div>
                <div class="profile-info">
                    <h3>${profile.name}</h3>
                    <p class="company-type">${profile.type}</p>
                    <div class="rating">${stars} ${profile.rating}</div>
                </div>
            </div>
            
            <div class="profile-stats-small">
                <div class="stat-item">
                    <span class="stat-number">${profile.jobsPosted}</span>
                    <span class="stat-label">Jobs Posted</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${profile.employeesHired}</span>
                    <span class="stat-label">Hired</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${profile.responseRate}</span>
                    <span class="stat-label">Response Rate</span>
                </div>
            </div>
            
            <div class="verified-badges">
                ${verifiedBadges}
            </div>
            
            <p style="color: var(--gray); font-size: 0.9rem; margin: 1rem 0;">
                ${profile.description.substring(0, 100)}...
            </p>
            
            <div class="skills-list">
                ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            
            <div class="message-actions" style="margin-top: 1rem;">
                <button class="action-btn view-profile-btn view-full-profile" data-profile-id="${profile.id}">
                    <i class="fas fa-eye"></i> View Full Profile
                </button>
                <button class="action-btn accept-btn">
                    <i class="fas fa-star"></i> Rate Employer
                </button>
            </div>
        `;
        
        return card;
    }
    
    function createEmployerProfileDetails(profile) {
        // Create stars for rating
        const stars = getStarRating(profile.rating);
        
        // Create verified badges
        const verifiedBadges = profile.verified.map(v => 
            `<span class="verified-badge"><i class="fas fa-check-circle"></i> ${v} Verified</span>`
        ).join('');
        
        // Create skills list
        const skillsList = profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
        
        return `
            <div class="profile-detail-header">
                <div class="profile-detail-avatar">${profile.initials}</div>
                <div class="profile-detail-info">
                    <h3>${profile.name}</h3>
                    <p class="company-detail-type">${profile.type}</p>
                    <div class="rating-detail">${stars} ${profile.rating}/5.0</div>
                    <div style="margin-top: 0.5rem;">
                        ${verifiedBadges}
                    </div>
                </div>
            </div>
            
            <div class="profile-detail-stats">
                <div class="stat-detail-card">
                    <span class="stat-detail-value">${profile.jobsPosted}</span>
                    <span class="stat-detail-label">Jobs Posted</span>
                </div>
                <div class="stat-detail-card">
                    <span class="stat-detail-value">${profile.employeesHired}</span>
                    <span class="stat-detail-label">Employees Hired</span>
                </div>
                <div class="stat-detail-card">
                    <span class="stat-detail-value">${profile.responseRate}</span>
                    <span class="stat-detail-label">Response Rate</span>
                </div>
                <div class="stat-detail-card">
                    <span class="stat-detail-value">${profile.memberSince}</span>
                    <span class="stat-detail-label">Member Since</span>
                </div>
            </div>
            
            <div class="profile-detail-section">
                <h4><i class="fas fa-info-circle"></i> About ${profile.name}</h4>
                <p>${profile.description}</p>
                <p><strong>Location:</strong> ${profile.location}</p>
            </div>
            
            <div class="profile-detail-section">
                <h4><i class="fas fa-tools"></i> Skills & Specializations</h4>
                <div class="skills-list">
                    ${skillsList}
                </div>
            </div>
            
            <div class="review-form">
                <h4><i class="fas fa-star"></i> Rate this Employer</h4>
                <div class="star-rating">
                    <span class="star" data-rating="1"><i class="fas fa-star"></i></span>
                    <span class="star" data-rating="2"><i class="fas fa-star"></i></span>
                    <span class="star" data-rating="3"><i class="fas fa-star"></i></span>
                    <span class="star" data-rating="4"><i class="fas fa-star"></i></span>
                    <span class="star" data-rating="5"><i class="fas fa-star"></i></span>
                </div>
                <textarea class="review-textarea" placeholder="Write your review about working with this employer..."></textarea>
                <button class="btn btn-primary" id="submitReviewBtn">
                    <i class="fas fa-paper-plane"></i> Submit Review
                </button>
            </div>
        `;
    }
    
    // ====== HELPER FUNCTIONS ======
    function getStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    function updateBadge(badgeId, count) {
        const badge = document.getElementById(badgeId);
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    function updateBadgeCounts() {
        // Update all badge counts
        const unreadApps = applicationsData.employeeApplications.filter(app => app.unread).length;
        updateBadge('applications-count', unreadApps);
        updateBadge('accepted-count', applicationsData.acceptedJobs.length);
        
        const unreadApplicants = applicationsData.employerApplicants.filter(app => app.unread).length;
        updateBadge('applicants-count', unreadApplicants);
        updateBadge('profiles-count', applicationsData.employerProfiles.length);
    }
    
    function updateEmptyState() {
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) return;
        
        const hasContent = activeTab.querySelector('.messages-list, .employer-profiles-list')?.children.length > 0;
        
        if (emptyState) {
            emptyState.style.display = hasContent ? 'none' : 'block';
            activeTab.style.display = hasContent ? 'block' : 'none';
        }
    }
    
    // ====== MODAL FUNCTIONS ======
    function showEmployerProfile(profileId) {
        const profile = applicationsData.employerProfiles.find(p => p.id == profileId);
        if (!profile) return;

        // Build HTML and ensure it's meaningful before showing the modal
        const html = (createEmployerProfileDetails(profile) || '').trim();
        if (!html || html.length < 40) {
            console.warn('Refusing to open employer profile modal — generated content was empty for id:', profileId);
            // Provide a friendly fallback message instead of an empty popup
            if (employerProfileDetails) employerProfileDetails.innerHTML = '<p class="empty-message">Profile details are not available at the moment.</p>';
            return;
        }

        employerProfileDetails.innerHTML = html;

        // Only display the modal when there is content to show
        if (profileModal) profileModal.style.display = 'flex';

        // Add star rating functionality
        setupStarRating();

        // Add review submission
        setupReviewSubmission(profileId);
    }
    
    function setupStarRating() {
        const stars = employerProfileDetails.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                
                // Update star display
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('active');
                        s.querySelector('i').className = 'fas fa-star';
                    } else {
                        s.classList.remove('active');
                        s.querySelector('i').className = 'far fa-star';
                    }
                });
            });
        });
    }
    
    function setupReviewSubmission(profileId) {
        const submitBtn = document.getElementById('submitReviewBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                const textarea = employerProfileDetails.querySelector('.review-textarea');
                const activeStars = employerProfileDetails.querySelectorAll('.star.active').length;
                
                if (activeStars === 0) {
                    alert('Please select a rating');
                    return;
                }
                
                if (!textarea.value.trim()) {
                    alert('Please write a review');
                    return;
                }
                
                // In a real app, this would send to a backend
                alert(`Thank you for your ${activeStars}-star review!`);
                textarea.value = '';
                profileModal.style.display = 'none';
            });
        }
    }
    
    // ====== EVENT HANDLERS ======
    function handleAcceptApplication(applicantId) {
        const applicant = applicationsData.employerApplicants.find(a => a.id == applicantId);
        if (applicant) {
            if (confirm(`Accept ${applicant.applicantName}'s application for ${applicant.jobTitle}?`)) {
                // Remove from applicants list
                applicationsData.employerApplicants = applicationsData.employerApplicants.filter(a => a.id != applicantId);
                
                // Reload applicants list
                loadEmployerApplicants();
                
                // Show success message
                alert(`Application accepted! ${applicant.applicantName} has been notified.`);
            }
        }
    }
    
    function handleRejectApplication(applicantId) {
        const applicant = applicationsData.employerApplicants.find(a => a.id == applicantId);
        if (applicant) {
            if (confirm(`Reject ${applicant.applicantName}'s application?`)) {
                // Remove from applicants list
                applicationsData.employerApplicants = applicationsData.employerApplicants.filter(a => a.id != applicantId);
                
                // Reload applicants list
                loadEmployerApplicants();
                
                alert(`Application rejected.`);
            }
        }
    }
    
    function handleToggleJobDetails(jobId) {
        const job = applicationsData.acceptedJobs.find(j => j.id == jobId);
        if (job) {
            job.showDetails = !job.showDetails;
            loadAcceptedJobs();
        }
    }
    
    function handleConfirmJob(jobId) {
        const job = applicationsData.acceptedJobs.find(j => j.id == jobId);
        if (job) {
            if (confirm(`Confirm acceptance of ${job.jobTitle} at ${job.employerName}?`)) {
                // Remove from accepted jobs (in real app, this would update status)
                applicationsData.acceptedJobs = applicationsData.acceptedJobs.filter(j => j.id != jobId);
                
                // Reload accepted jobs
                loadAcceptedJobs();
                
                alert(`Job confirmed! You're all set to start on ${job.startDate}.`);
            }
        }
    }
    
    // ====== EVENT LISTENERS SETUP ======
    function setupEventListeners() {
        // User type buttons
        userTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                setUserType(this.dataset.user);
            });
        });
        
        // Sidebar tabs
        sidebarTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                switchToTab(this.dataset.tab);
            });
        });
        
        // Browse jobs button
        if (browseJobsBtn) {
            browseJobsBtn.addEventListener('click', function() {
                window.location.href = '/jobs/';

            });
        }
        
        // Close modal button
        if (closeProfileModal) {
            closeProfileModal.addEventListener('click', function() {
                profileModal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        if (profileModal) {
            profileModal.addEventListener('click', function(e) {
                if (e.target === profileModal) {
                    profileModal.style.display = 'none';
                }
            });
        }

        // Accessibility: close modal with Escape key (keyboard users)
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && profileModal && profileModal.style.display !== 'none') {
                profileModal.style.display = 'none';
            }
        });
        
        // Delegate events for dynamic content
        document.addEventListener('click', function(e) {
            // View employer profile buttons
            if (e.target.closest('.view-profile-btn')) {
                const btn = e.target.closest('.view-profile-btn');
                const profileId = btn.dataset.profileId || btn.dataset.employerId;
                if (profileId) {
                    showEmployerProfile(profileId);
                }
            }
            
            // Accept application buttons (employer view)
            if (e.target.closest('.accept-btn') && e.target.closest('.accept-btn').dataset.applicantId) {
                const btn = e.target.closest('.accept-btn');
                handleAcceptApplication(btn.dataset.applicantId);
            }
            
            // Reject application buttons (employer view)
            if (e.target.closest('.reject-btn') && e.target.closest('.reject-btn').dataset.applicantId) {
                const btn = e.target.closest('.reject-btn');
                handleRejectApplication(btn.dataset.applicantId);
            }
            
            // Toggle job details buttons
            if (e.target.closest('.toggle-details-btn')) {
                const btn = e.target.closest('.toggle-details-btn');
                handleToggleJobDetails(btn.dataset.jobId);
            }
            
            // Confirm job acceptance buttons
            if (e.target.closest('.confirm-btn')) {
                const btn = e.target.closest('.confirm-btn');
                handleConfirmJob(btn.dataset.jobId);
            }
            
            // View full profile buttons
            if (e.target.closest('.view-full-profile')) {
                const btn = e.target.closest('.view-full-profile');
                showEmployerProfile(btn.dataset.profileId);
            }
        });
    }
    
    // ====== ANIMATIONS ======
    function animateFloatingShapes() {
        const shapes = document.querySelectorAll('.floating-shape');
        shapes.forEach((shape, index) => {
            // Randomize initial positions
            shape.style.left = `${Math.random() * 80 + 5}%`;
            shape.style.top = `${Math.random() * 80 + 5}%`;
            
            // Randomize animation duration
            const duration = 20 + Math.random() * 20;
            shape.style.animationDuration = `${duration}s`;
            
            // Randomize animation direction
            if (Math.random() > 0.5) {
                shape.style.animationDirection = 'reverse';
            }
        });
    }
    
    function setupMouseEffects() {
        const follower = document.querySelector('.mouse-follower');
        if (follower) {
            document.addEventListener('mousemove', (e) => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                // Update mouse follower
                follower.style.left = `${mouseX - 15}px`;
                follower.style.top = `${mouseY - 15}px`;
            });
        }
    }
    
    // ====== INITIALIZE ======
    init();
});