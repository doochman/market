<template>
    <v-container>
      <!-- Loading State -->
      <v-row v-if="isLoading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="#3B82F6" size="50"></v-progress-circular>
        </v-col>
      </v-row>
      <!-- Error State -->
      <v-row v-else-if="error">
        <v-col cols="12">
          <v-alert type="error" outlined rounded="lg">
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>
      <!-- Profile Content -->
      <template v-else>
        <v-row>
          <v-col cols="12">
            <!-- Profile Details -->
            <v-card class="profile-card pa-4 mb-6" elevation="2" rounded="lg">
              <v-list>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-avatar size="48" color="#EC4899">
                      <span class="text-white text-lg font-medium">
                        {{ (profile.displayName || profile.email || 'U')?.[0]?.toUpperCase() || 'U' }}
                      </span>
                    </v-avatar>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="text-h6 font-weight-semibold text-gray-800">
                      {{ profile.displayName || 'Unknown User' }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 text-gray-700">
                      {{ profile.email || 'No email' }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="text-subtitle-1 font-weight-semibold text-gray-800">
                      Role
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 text-gray-700">
                      {{ profile.role || 'User' }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="text-subtitle-1 font-weight-semibold text-gray-800">
                      Rating
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <v-rating
                        :value="profile.rating || 0"
                        color="#FBBF24"
                        background-color="#E5E7EB"
                        half-increments
                        readonly
                        dense
                        size="20"
                      ></v-rating>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="text-subtitle-1 font-weight-semibold text-gray-800">
                      Last Active
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip small color="#E5E7EB" text-color="#1F2A44">
                        {{ lastActiveFormatted || 'Unknown' }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-card-actions v-if="isOwnProfile || isAdmin">
                <v-spacer></v-spacer>
                <v-btn
                  color="#3B82F6"
                  dark
                  depressed
                  rounded
                  @click="startEditing"
                >
                  Edit Profile
                </v-btn>
              </v-card-actions>
            </v-card>
  
            <!-- Edit Profile Form -->
            <v-card v-if="editing" class="profile-card pa-4 mb-6" elevation="2" rounded="lg">
              <v-form ref="profileForm" @submit.prevent="saveProfile">
                <v-text-field
                  v-model="editedProfile.displayName"
                  label="Display Name"
                  outlined
                  dense
                  class="mb-4"
                  :rules="[v => !!v || 'Display name is required']"
                ></v-text-field>
                <v-text-field
                  v-model="editedProfile.email"
                  label="Email"
                  outlined
                  dense
                  class="mb-4"
                  disabled
                ></v-text-field>
                <v-text-field
                  v-if="isAdmin"
                  v-model.number="editedProfile.rating"
                  label="Rating (0-5)"
                  type="number"
                  outlined
                  dense
                  class="mb-4"
                  :rules="[v => (v >= 0 && v <= 5) || 'Rating must be between 0 and 5']"
                ></v-text-field>
                <div class="d-flex justify-end">
                  <v-btn
                    color="#4B5563"
                    variant="text"
                    depressed
                    rounded
                    @click="cancelEditing"
                    class="mr-2"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="#3B82F6"
                    dark
                    type="submit"
                    depressed
                    rounded
                    :loading="saving"
                  >
                    Save
                  </v-btn>
                </div>
              </v-form>
            </v-card>
  
            <!-- Assets Created -->
            <v-card class="assets-card pa-4" elevation="2" rounded="lg">
              <h3 class="text-h6 font-weight-semibold mb-4 text-gray-800">Assets Created</h3>
              <v-list v-if="assets.length">
                <v-list-item
                  v-for="asset in assets"
                  :key="asset.id"
                  :to="'/asset/' + asset.id"
                  class="asset-item"
                >
                  <v-list-item-content>
                    <v-list-item-title class="text-subtitle-1 text-gray-800">
                      {{ asset.title || 'Untitled Asset' }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 text-gray-600">
                      Created: {{ formatDate(asset.createdAt) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-card-text v-else class="text-body-1 text-gray-600">
                No assets created yet.
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
  
  export default {
    setup() {
      const route = useRoute();
      const auth = getAuth();
      const db = getFirestore();
      const profile = ref({});
      const assets = ref([]);
      const editing = ref(false);
      const saving = ref(false);
      const isLoading = ref(true);
      const error = ref(null);
      const profileForm = ref(null);
      const editedProfile = ref({});
      const isOwnProfile = ref(false);
      const isAdmin = ref(false);
      let unsubscribeAssets = null;
  
      // Fetch profile data
      const fetchProfile = async () => {
        try {
          isLoading.value = true;
          const userId = route.params.userId;
          const profileRef = doc(db, 'profiles', userId);
          const profileDoc = await getDoc(profileRef);
  
          if (profileDoc.exists()) {
            profile.value = {
              id: profileDoc.id,
              displayName: profileDoc.data().displayName || 'Unknown User',
              email: profileDoc.data().email || 'No email',
              role: profileDoc.data().role || 'user',
              rating: profileDoc.data().rating || 0,
              lastActive: profileDoc.data().lastActive || null,
            };
          } else {
            profile.value = {
              id: userId,
              displayName: 'Unknown User',
              email: auth.currentUser?.email || 'No email',
              role: 'user',
              rating: 0,
              lastActive: null,
            };
          }
          editedProfile.value = { ...profile.value };
  
          // Check if this is the current user's profile
          isOwnProfile.value = auth.currentUser && auth.currentUser.uid === userId;
  
          // Check if current user is admin
          if (auth.currentUser) {
            const currentUserProfile = await getDoc(doc(db, 'profiles', auth.currentUser.uid));
            isAdmin.value = currentUserProfile.exists() && currentUserProfile.data().role === 'admin';
          }
  
          // Update or create lastActive for own profile
          if (isOwnProfile.value) {
            const lastActiveData = {
              lastActive: new Date().toISOString(),
              displayName: profile.value.displayName,
              email: auth.currentUser?.email || profile.value.email,
              role: profile.value.role,
              rating: profile.value.rating,
            };
            // Use setDoc with merge to create or update
            await setDoc(profileRef, lastActiveData, { merge: true });
            profile.value.lastActive = lastActiveData.lastActive;
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          error.value = 'Failed to load profile. Please try again.';
        } finally {
          isLoading.value = false;
        }
      };
  
      // Fetch assets created by user
      const fetchAssets = () => {
        const q = query(collection(db, 'assets'), where('userId', '==', route.params.userId));
        unsubscribeAssets = onSnapshot(q, (snapshot) => {
          assets.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }, (err) => {
          console.error('Error fetching assets:', err);
          error.value = 'Failed to load assets.';
        });
      };
  
      // Format lastActive date
      const lastActiveFormatted = computed(() => {
        if (!profile.value.lastActive) return null;
        const date = new Date(profile.value.lastActive);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      });
  
      // Format asset created date
      const formatDate = (isoString) => {
        if (!isoString) return 'Unknown';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      };
  
      const startEditing = () => {
        editing.value = true;
      };
  
      const cancelEditing = () => {
        editedProfile.value = { ...profile.value };
        editing.value = false;
        if (profileForm.value) {
          profileForm.value.resetValidation();
        }
      };
  
      const saveProfile = async () => {
        if (!profileForm.value.validate()) return;
        saving.value = true;
        try {
          const profileRef = doc(db, 'profiles', profile.value.id);
          const updateData = {
            displayName: editedProfile.value.displayName,
            lastActive: new Date().toISOString(),
          };
          if (isAdmin.value && editedProfile.value.rating !== undefined) {
            updateData.rating = Number(editedProfile.value.rating);
          }
          await setDoc(profileRef, updateData, { merge: true });
          profile.value = { ...profile.value, ...updateData };
          editing.value = false;
          if (profileForm.value) {
            profileForm.value.resetValidation();
          }
        } catch (error) {
          console.error('Error saving profile:', error);
          alert('Failed to save profile.');
        } finally {
          saving.value = false;
        }
      };
  
      onMounted(() => {
        fetchProfile();
        fetchAssets();
      });
  
      onUnmounted(() => {
        if (unsubscribeAssets) unsubscribeAssets();
      });
  
      return {
        profile,
        assets,
        editing,
        saving,
        isLoading,
        error,
        profileForm,
        editedProfile,
        isOwnProfile,
        isAdmin,
        lastActiveFormatted,
        formatDate,
        startEditing,
        cancelEditing,
        saveProfile,
      };
    },
  };
  </script>
  
  <style scoped>
  .profile-card {
    width: 100%;
    background-color: #FFFFFF;
    transition: all 0.3s ease;
  }
  .profile-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .assets-card {
    width: 100%;
    background-color: #FFFFFF;
    transition: all 0.3s ease;
  }
  .assets-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .asset-item:hover {
    background-color: #F9FAFB;
  }
  .text-gray-800 {
    color: #1F2A44;
  }
  .text-gray-700 {
    color: #374151;
  }
  .text-gray-600 {
    color: #4B5563;
  }
  .text-blue-500 {
    color: #3B82F6;
  }
  .text-blue-500:hover {
    color: #2563EB;
  }
  .font-weight-semibold {
    font-weight: 600;
  }
  </style>