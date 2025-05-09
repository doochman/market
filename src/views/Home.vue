<template>
    <v-container>
      <h1 class="my-4">Enterprise Marketplace</h1>
  
      <!-- Filters and Asset List -->
      <v-row>
        <v-col md="3">
          <v-card flat>
            <v-card-title>Tags</v-card-title>
            <v-list>
              <v-list-item
                v-for="tag in tags"
                :key="tag"
                @click="filterByTag(tag)"
              >
                <v-list-item-title>{{ tag }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col md="9">
          <v-row>
            <v-col v-for="asset in filteredAssets" :key="asset.id" cols="12" sm="6" md="4">
              <AssetCard :asset="asset" @tag-clicked="filterByTag" />
            </v-col>
            <v-col v-if="!filteredAssets.length" cols="12">
              <v-alert type="info">No assets found. Try adjusting your search or filters.</v-alert>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getFirestore, collection, query, getDocs, where } from 'firebase/firestore';
  import AssetCard from '../components/AssetCard.vue';
  
  export default {
    components: {
      AssetCard,
    },
    setup() {
      const assets = ref([]);
      const tags = ref([]);
      const route = useRoute();
      const router = useRouter();
  
      const fetchTags = async () => {
        const db = getFirestore();
        const assetsSnapshot = await getDocs(collection(db, 'assets'));
        const allTags = new Set();
        assetsSnapshot.forEach(doc => {
          const asset = doc.data();
          asset.tags?.forEach(tag => allTags.add(tag));
        });
        tags.value = [...allTags].sort();
      };
  
      const fetchAssets = async () => {
        const db = getFirestore();
        let q = query(collection(db, 'assets'));
  
        if (route.query.tag) {
          q = query(
            collection(db, 'assets'),
            where('tags', 'array-contains', route.query.tag)
          );
        }
  
        try {
          const snapshot = await getDocs(q);
          assets.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          console.error('Error fetching assets:', error);
        }
      };
  
      const filteredAssets = computed(() => {
        const searchTerm = route.query.search?.toLowerCase().trim() || '';
        if (!searchTerm && !route.query.tag) {
          return assets.value; // Return all assets if no search or tag
        }
        return assets.value.filter(asset =>
          asset.name.toLowerCase().includes(searchTerm) ||
          asset.description.toLowerCase().includes(searchTerm)
        );
      });
  
      const filterByTag = tag => {
        router.push({ query: { tag } });
      };
  
      onMounted(() => {
        fetchTags();
        fetchAssets();
      });
  
      watch(() => route.query, () => {
        fetchAssets();
      });
  
      return {
        filteredAssets,
        tags,
        filterByTag,
      };
    },
  };
  </script>