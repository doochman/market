<template>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Enterprise Marketplace</v-toolbar-title>
      <v-btn to="/">Home</v-btn>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="searchQuery"
        label="Search"
        solo
        flat
        hide-details
        append-icon="mdi-magnify"
        @input="search"
      ></v-text-field>
      <v-btn v-if="user" to="/submit">Submit Asset</v-btn>
      <v-btn v-if="user" :to="'/profile/' + user.uid">Profile</v-btn>
      <v-btn v-if="user" @click="logout">Logout</v-btn>
      <v-btn v-else @click="login">Login</v-btn>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ $vuetify.theme.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waxing-crescent' }}</v-icon>
      </v-btn>
    </v-app-bar>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const searchQuery = ref('');
      const auth = getAuth();
      const user = ref(auth.currentUser);
      const router = useRouter();
  
      auth.onAuthStateChanged(u => {
        user.value = u;
      });
  
      const search = () => {
        const query = searchQuery.value.trim();
        if (query) {
          router.push({ query: { search: query } });
        } else {
          router.push({ query: {} });
        }
      };
  
      const login = async () => {
        try {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
        } catch (error) {
          console.error('Login error:', error);
        }
      };
  
      const logout = async () => {
        try {
          await signOut(auth);
          router.replace({ path: '/', query: {} });
        } catch (error) {
          console.error('Logout error:', error);
        }
      };
  
      const toggleTheme = () => {
        const vuetify = window.$nuxt?.$vuetify || window.$vueApp?._context.provides.vuetify;
        vuetify.theme.global.name = vuetify.theme.global.current.dark ? 'magentaTheme' : 'darkTheme';
      };
  
      return { searchQuery, search, user, login, logout, toggleTheme };
    },
  };
  </script>