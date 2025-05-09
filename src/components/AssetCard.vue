<template>
    <v-card hover>
      <v-img :src="asset.imageUrl" height="200px" cover></v-img>
      <v-card-title>{{ asset.name }}</v-card-title>
      <v-card-text>
        <v-chip
          v-for="tag in asset.tags"
          :key="tag"
          class="ma-1"
          color="primary"
          elevated
          @click="$emit('tag-clicked', tag)"
        >
          {{ tag }}
        </v-chip>
        <p>{{ asset.description.substring(0, 100) }}...</p>
      </v-card-text>
      <v-card-actions>
        <v-btn :to="'/asset/' + asset.id">View Details</v-btn>
        <v-chip>{{ asset.views || 0 }} Views</v-chip>
        <v-chip>{{ commentsCount }} Comments</v-chip>
      </v-card-actions>
    </v-card>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
  
  export default {
    props: {
      asset: {
        type: Object,
        required: true,
      },
    },
    emits: ['tag-clicked'],
    setup(props) {
      const db = getFirestore();
      const commentsCount = ref(0);
  
      onMounted(() => {
        onSnapshot(collection(db, `assets/${props.asset.id}/comments`), snapshot => {
          commentsCount.value = snapshot.size;
        });
      });
  
      return {
        commentsCount,
      };
    },
  };
  </script>