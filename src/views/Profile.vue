<template>
    <v-container>
      <h1 class="my-4">User Profile</h1>
      <v-card class="pa-6" elevation="2">
        <!-- User Info -->
        <v-row>
          <v-col cols="12" sm="4" class="text-center">
            <v-avatar size="100">
              <v-img :src="avatarSource" alt="User avatar"></v-img>
            </v-avatar>
            <v-file-input
              v-if="isOwnProfile"
              v-model="avatarFile"
              label="Upload Avatar"
              accept="image/*"
              class="mt-2"
              @change="uploadAvatar"
            ></v-file-input>
            <h2 class="mt-2">{{ profile.displayName || profile.email || 'User' }}</h2>
          </v-col>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="profile.name"
              label="Name"
              outlined
              :disabled="!isOwnProfile"
              @change="saveProfile"
            ></v-text-field>
            <v-text-field
              v-model="profile.surname"
              label="Surname"
              outlined
              :disabled="!isOwnProfile"
              @change="saveProfile"
            ></v-text-field>
            <v-text-field
              v-model="profile.companyEmail"
              label="Company Email"
              outlined
              :disabled="!isOwnProfile"
              @change="saveProfile"
            ></v-text-field>
            <v-text-field
              v-model="profile.bio"
              label="Bio"
              outlined
              :disabled="!isOwnProfile"
              @change="saveProfile"
            ></v-text-field>
            <v-text-field
              v-model="profile.country"
              label="Country"
              outlined
              :disabled="!isOwnProfile"
              @change="saveProfile"
            ></v-text-field>
            <v-btn v-if="isOwnProfile" color="primary" @click="saveProfile">Save Profile</v-btn>
          </v-col>
        </v-row>
        <v-divider class="my-4"></v-divider>
        <!-- Activity Tabs -->
        <v-tabs v-model="activeTab" color="primary">
          <v-tab>Submitted Assets</v-tab>
          <v-tab>Comments</v-tab>
          <v-tab>Liked Tags</v-tab>
        </v-tabs>
        <v-tabs-items v-model="activeTab">
          <!-- Submitted Assets -->
          <v-tab-item>
            <v-row class="mt-4">
              <v-col v-for="asset in userAssets" :key="asset.id" cols="12" sm="6" md="4">
                <v-card>
                  <v-img :src="asset.imageUrl" height="150px" cover></v-img>
                  <v-card-title>{{ asset.name }}</v-card-title>
                  <v-card-text>{{ asset.description.substring(0, 100) }}...</v-card-text>
                  <v-card-actions>
                    <v-btn :to="'/asset/' + asset.id">View Details</v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col v-if="!userAssets.length" cols="12">
                <v-alert type="info">No assets submitted.</v-alert>
              </v-col>
            </v-row>
          </v-tab-item>
          <!-- Comments -->
          <v-tab-item>
            <v-list class="mt-4">
              <v-list-item v-for="comment in userComments" :key="comment.id">
                <v-list-item-content>
                  <v-list-item-title>
                    On <router-link :to="'/asset/' + comment.assetId">{{ comment.assetName }}</router-link>
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ comment.text }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="!userComments.length">
                <v-list-item-content>
                  <v-alert type="info">No comments posted.</v-alert>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-tab-item>
          <!-- Liked Tags -->
          <v-tab-item>
            <v-chip-group class="mt-4">
              <v-chip v-for="tag in likedTags" :key="tag" color="primary">
                {{ tag }}
              </v-chip>
              <v-alert v-if="!likedTags.length" type="info">No tags liked.</v-alert>
            </v-chip-group>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  
  export default {
    setup() {
      const route = useRoute();
      const auth = getAuth();
      const db = getFirestore();
      const storage = getStorage();
      const profile = ref({});
      const userAssets = ref([]);
      const userComments = ref([]);
      const likedTags = ref([]);
      const activeTab = ref(0);
      const user = ref(auth.currentUser);
      const avatarFile = ref(null);
  
      auth.onAuthStateChanged(u => {
        user.value = u;
      });
  
      const isOwnProfile = computed(() => {
        return user.value && user.value.uid === route.params.userId;
      });
  
      const avatarSource = computed(() => {
        if (profile.value.avatarUrl) return profile.value.avatarUrl;
        return generateInitialsAvatar(profile.value.name, profile.value.surname);
      });
  
      const generateInitialsAvatar = (name, surname) => {
        const initials = (name?.charAt(0) || '') + (surname?.charAt(0) || '');
        if (!initials) return 'https://via.placeholder.com/100';
        
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#C2185B'; // Magenta theme
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials.toUpperCase(), 50, 50);
        return canvas.toDataURL();
      };
  
      const fetchProfile = async () => {
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', route.params.userId));
          if (profileDoc.exists()) {
            profile.value = {
              ...profileDoc.data(),
              email: route.params.userId,
            };
          } else {
            profile.value = {
              email: route.params.userId,
              name: '',
              surname: '',
              companyEmail: '',
              bio: '',
              country: '',
              avatarUrl: '',
              displayName: '',
            };
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
  
      const uploadAvatar = async () => {
        if (!avatarFile.value || !isOwnProfile.value) return;
        try {
          const imageRef = storageRef(storage, `avatars/${route.params.userId}/${avatarFile.value.name}`);
          await uploadBytes(imageRef, avatarFile.value);
          const avatarUrl = await getDownloadURL(imageRef);
          profile.value.avatarUrl = avatarUrl;
          await saveProfile();
          avatarFile.value = null;
        } catch (error) {
          console.error('Error uploading avatar:', error);
          alert('Failed to upload avatar.');
        }
      };
  
      const saveProfile = async () => {
        if (!isOwnProfile.value) return;
        try {
          await setDoc(doc(db, 'profiles', route.params.userId), {
            name: profile.value.name || '',
            surname: profile.value.surname || '',
            companyEmail: profile.value.companyEmail || '',
            bio: profile.value.bio || '',
            country: profile.value.country || '',
            avatarUrl: profile.value.avatarUrl || '',
            displayName: profile.value.displayName || profile.value.email,
          }, { merge: true });
          alert('Profile updated successfully!');
        } catch (error) {
          console.error('Error saving profile:', error);
          alert('Failed to update profile.');
        }
      };
  
      const fetchUserAssets = async () => {
        const q = query(collection(db, 'assets'), where('userId', '==', route.params.userId));
        const snapshot = await getDocs(q);
        userAssets.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      };
  
      const fetchUserComments = async () => {
        const assetsSnapshot = await getDocs(collection(db, 'assets'));
        const comments = [];
        for (const assetDoc of assetsSnapshot.docs) {
          const assetId = assetDoc.id;
          const assetName = assetDoc.data().name;
          const q = query(
            collection(db, `assets/${assetId}/comments`),
            where('userId', '==', route.params.userId)
          );
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            comments.push({
              id: doc.id,
              assetId,
              assetName,
              ...doc.data(),
            });
          });
        }
        userComments.value = comments;
      };
  
      const fetchLikedTags = async () => {
        const q = query(collection(db, 'tagLikes'));
        const snapshot = await getDocs(q);
        likedTags.value = snapshot.docs
          .filter(doc => doc.data().userIds?.includes(route.params.userId))
          .map(doc => doc.id);
      };
  
      onMounted(() => {
        fetchProfile();
        fetchUserAssets();
        fetchUserComments();
        fetchLikedTags();
      });
  
      return {
        profile,
        userAssets,
        userComments,
        likedTags,
        activeTab,
        isOwnProfile,
        avatarFile,
        avatarSource,
        uploadAvatar,
        saveProfile,
      };
    },
  };
  </script>