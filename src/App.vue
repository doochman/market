<template>
  <v-app>
    <Navigation v-if="isInitialized" />
    <v-main>
      <router-view v-if="isInitialized"></router-view>
      <v-progress-circular v-else indeterminate color="primary" class="ma-5"></v-progress-circular>
    </v-main>
    <Footer v-if="isInitialized" />
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navigation from './components/Navigation.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    Navigation,
    Footer,
  },
  setup() {
    const isInitialized = ref(false);

    onMounted(() => {
      const auth = getAuth();
      onAuthStateChanged(auth, () => {
        isInitialized.value = true;
      });
    });

    return { isInitialized };
  },
};
</script>