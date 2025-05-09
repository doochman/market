<template>
    <v-container>
      <!-- Back Button -->
      <v-btn text class="mb-4" @click="$router.go(-1)">
        <v-icon left>mdi-arrow-left</v-icon> Back
      </v-btn>
  
      <!-- Loading State -->
      <v-progress-circular v-if="loading" indeterminate color="primary" class="ma-5"></v-progress-circular>
  
      <!-- Error State -->
      <v-alert v-else-if="error" type="error" class="my-4">{{ error }}</v-alert>
  
      <!-- Asset Details and Edit Form -->
      <div v-else>
        <AssetInfo
          :asset="asset"
          :isEV-admin="isAdminUser"
          :delete-loading="deleteLoading"
          @edit="editMode = true"
          @delete="deleteAsset"
        />
        <AssetEditForm
          v-if="editMode"
          :asset="asset"
          :save-loading="saveLoading"
          @save="saveChanges"
          @cancel="cancelEdit"
        />
        <v-divider class="my-6"></v-divider>
        <Comments :collection-path="`assets/${asset.id}/comments`" />
      </div>
    </v-container>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, getDoc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import AssetInfo from '../components/AssetInfo.vue';
  import AssetEditForm from '../components/AssetEditForm.vue';
  import Comments from '../components/Comments.vue';
  
  export default {
    components: {
      AssetInfo,
      AssetEditForm,
      Comments,
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const auth = getAuth();
      const db = getFirestore();
      const storage = getStorage();
      const asset = ref({});
      const loading = ref(true);
      const error = ref(null);
      const editMode = ref(false);
      const saveLoading = ref(false);
      const deleteLoading = ref(false);
      const isAdminUser = ref(false);
  
      auth.onAuthStateChanged(async u => {
        if (u) {
          const profileDoc = await getDoc(doc(db, 'profiles', u.uid));
          isAdminUser.value = profileDoc.exists() && profileDoc.data().role === 'admin';
        } else {
          isAdminUser.value = false;
        }
      });
  
      const fetchAsset = async () => {
        try {
          const assetDoc = await getDoc(doc(db, 'assets', route.params.id));
          if (assetDoc.exists()) {
            asset.value = { id: assetDoc.id, ...assetDoc.data() };
            // Increment views
            await updateDoc(doc(db, 'assets', route.params.id), {
              views: increment(1)
            });
          } else {
            error.value = 'Asset not found.';
          }
        } catch (err) {
          console.error('Error fetching asset:', err);
          error.value = 'Failed to load asset.';
        } finally {
          loading.value = false;
        }
      };
  
      const deleteAsset = async () => {
        if (!isAdminUser.value) return;
        deleteLoading.value = true;
        try {
          await deleteDoc(doc(db, 'assets', route.params.id));
          alert('Asset deleted successfully.');
          router.push('/');
        } catch (error) {
          console.error('Error deleting asset:', error);
          alert('Failed to delete asset.');
        } finally {
          deleteLoading.value = false;
        }
      };
  
      const saveChanges = async (editedAsset, tagsInput) => {
        saveLoading.value = true;
        try {
          const tags = tagsInput
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag);
          const searchTerms = [
            editedAsset.name.toLowerCase(),
            ...tags,
          ].filter(term => term);
          let imageUrl = editedAsset.imageUrl;
          if (editedAsset.imageFile) {
            const imageRef = storageRef(storage, `assets/${auth.currentUser.uid}/${editedAsset.imageFile.name}`);
            await uploadBytes(imageRef, editedAsset.imageFile);
            imageUrl = await getDownloadURL(imageRef);
          }
          await updateDoc(doc(db, 'assets', route.params.id), {
            name: editedAsset.name,
            description: editedAsset.description,
            tags,
            searchTerms,
            imageUrl,
            gitlabLink: editedAsset.gitlabLink || '',
            demoLink: editedAsset.demoLink || '',
            docLink: editedAsset.docLink || '',
            updatedAt: new Date(),
          });
          await fetchAsset();
          editMode.value = false;
          alert('Asset updated successfully.');
        } catch (error) {
          console.error('Error updating asset:', error);
          alert('Failed to update asset.');
        } finally {
          saveLoading.value = false;
        }
      };
  
      const cancelEdit = () => {
        editMode.value = false;
      };
  
      onMounted(() => {
        fetchAsset();
      });
  
      return {
        asset,
        loading,
        error,
        editMode,
        saveLoading,
        deleteLoading,
        isAdminUser,
        deleteAsset,
        saveChanges,
        cancelEdit,
      };
    },
  };
  </script>