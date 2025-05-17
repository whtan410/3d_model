<template>
  <nav class="custom-navbar">
    <div class="navbar-content">
      <div 
        class="navbar-logo" 
        @click="navigateTo('/')" 
        style="cursor: pointer;"
      >
        AliTeach
      </div>
      <div class="navbar-links">
        <a href="#" @click.prevent="navigateTo('/')" class="nav-link">Home</a>
        <a href="#" @click.prevent="navigateTo('/chatbotpage')" class="nav-link">Learning</a>
        <a href="#" class="nav-link">Community</a> </div>
      <div class="navbar-actions">
        <div v-if="isLoggedIn" class="profile-container">
          <img 
            :src="userProfile.profilePicture || defaultProfilePicture" 
            alt="Profile" 
            class="profile-picture"
            @click="toggleProfileMenu"
          />
          <div v-if="showProfileMenu" class="profile-menu">
            <div class="profile-menu-item">{{ userProfile.name || 'User' }}</div>
            <div class="profile-menu-item" @click="navigateToAccount">My Account</div>
            <div class="profile-menu-item" @click="navigateToSettings">Settings</div>
            <div class="profile-menu-item logout" @click="logout">Logout</div>
          </div>
        </div>
        <template v-else>
          <button class="btn btn-signin" @click="login">Sign In</button>
          <button class="btn btn-signup" @click="signup">Sign Up</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'CustomNavbar',
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false
    },
    userProfile: {
      type: Object,
      default: () => ({
        name: '',
        profilePicture: ''
      })
    }
  },
  data() {
    return {
      showProfileMenu: false,
      defaultProfilePicture: 'https://images.pexels.com/photos/11273201/pexels-photo-11273201.jpeg?auto=compress&cs=tinysrgb&w=600' // Placeholder
    };
  },
  methods: {
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    navigateTo(path) {
      if (this.$router) {
        this.$router.push(path).catch(err => {
          // Optional: handle navigation errors, e.g., for duplicate navigation
          if (err.name !== 'NavigationDuplicated') {
            console.error('Router navigation error:', err);
          }
        });
      } else {
        console.warn('Vue Router is not available. Cannot navigate to', path);
        // Fallback: You might want to use window.location.href for non-SPA behavior,
        // but this will cause a full page reload.
        // window.location.href = path;
      }
      this.showProfileMenu = false; // Close menu on navigation
    },
    navigateToAccount() {
      // Assuming you have a route named '/account' or similar
      this.navigateTo('/account'); 
    },
    navigateToSettings() {
      // Assuming you have a route named '/settings' or similar
      this.navigateTo('/settings');
    },
    login() {
      this.$emit('login');
    },
    signup() {
      this.$emit('signup');
    },
    logout() {
      this.showProfileMenu = false;
      this.$emit('logout');
    },
    // Method to close profile menu when clicking outside
    closeProfileMenuOnClickOutside(e) {
      const profileContainer = this.$el.querySelector('.profile-container');
      if (profileContainer && !profileContainer.contains(e.target)) {
        this.showProfileMenu = false;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.closeProfileMenuOnClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeProfileMenuOnClickOutside);
  }
}
</script>

<style scoped>
.custom-navbar {
  background-color: #ffffff; /* White background for the bar itself */
  border: 2px solid #4db6ac; /* Teal border */
  border-radius: 50px; /* Large border-radius for pill shape */
  padding: 10px 25px; /* Adjust padding as needed */
  margin: 20px; /* Example margin, adjust as needed */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Optional subtle shadow */
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navbar-logo {
  font-size: 28px; /* Adjust size as needed */
  font-weight: bold;
  color: #00897b; /* Teal color for the logo text */
  margin-right: auto; /* Pushes other items to the right */
  /* cursor: pointer; Added inline for clarity but can be here */
}

.navbar-links {
  display: flex;
  gap: 30px; /* Space between links */
  margin: 0 auto; /* Centers the links if space allows */
}

.nav-link {
  text-decoration: none;
  color: #555555; /* Dark grey for links */
  font-size: 16px; /* Adjust size as needed */
  padding: 5px 10px;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #00897b; /* Teal on hover */
}

.navbar-actions {
  display: flex;
  gap: 15px; /* Space between buttons */
  margin-left: auto; /* Pushes buttons to the right */
}

.btn {
  padding: 10px 25px; /* Adjust padding for button size */
  border: none;
  border-radius: 25px; /* Rounded buttons */
  font-size: 16px; /* Adjust size as needed */
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.btn-signin {
  background-color: #ffffff; /* White background */
  color: #4db6ac; /* Teal text */
  border: 2px solid #4db6ac; /* Teal border */
}

.btn-signin:hover {
  background-color: #f0f0f0; /* Lighter grey on hover */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.btn-signup {
  background-color: #4db6ac; /* Teal background */
  color: #ffffff; /* White text */
  border: 2px solid #4db6ac; /* Teal border, though background makes it less visible */
}

.btn-signup:hover {
  background-color: #26a69a; /* Darker teal on hover */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Profile picture styles */
.profile-container {
  position: relative;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #4db6ac;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.profile-picture:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

/* Profile dropdown menu */
.profile-menu {
  position: absolute;
  top: 50px; /* Adjust based on picture size and desired spacing */
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 180px;
  z-index: 100;
  overflow: hidden;
}

.profile-menu-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #333;
  font-size: 14px; /* Slightly smaller font for menu items */
}

.profile-menu-item:first-child { /* User name */
  font-weight: bold;
  border-bottom: 1px solid #eee;
  color: #00897b;
}

.profile-menu-item:not(:first-child):hover {
  background-color: #f5f5f5;
}

.profile-menu-item.logout {
  color: #f44336; /* Red for logout */
  border-top: 1px solid #eee;
}

.profile-menu-item.logout:hover {
  background-color: #ffebee; /* Light red background on hover for logout */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .custom-navbar {
    margin: 10px;
    padding: 10px 15px;
    border-radius: 20px; /* Less pronounced rounding on smaller screens */
  }
  .navbar-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .navbar-logo {
    margin-bottom: 15px;
    margin-right: 0; /* Reset margin */
  }
  .navbar-links {
    margin: 0 0 15px 0; /* Reset margin and add bottom margin */
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
    width: 100%; /* Make links take full width for easier tapping */
  }
  .nav-link {
    padding: 8px 0; /* Adjust padding for column layout */
  }
  .navbar-actions {
    margin-left: 0; /* Reset margin */
    width: 100%;
    justify-content: flex-start; /* Align buttons to the start */
    flex-direction: column; /* Stack buttons on mobile */
    gap: 10px;
  }
  .btn {
    width: 100%; /* Make buttons full-width on mobile */
    padding: 10px 15px;
  }
  .profile-menu {
    /* Adjust profile menu for mobile if needed, e.g., full width */
    width: calc(100% - 0px); /* Make it almost full width */
    left: 0;
    top: 45px; /* Adjust if needed */
  }
}

@media (max-width: 480px) {
    .navbar-logo {
        font-size: 24px;
    }
    .nav-link, .btn {
        font-size: 15px;
    }
}
</style>