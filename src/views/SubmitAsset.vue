<template>
    <v-container>
      <h1 class="my-4">Submit New Asset</h1>
      <v-form @submit.prevent="submitAsset" ref="form">
        <v-text-field
          v-model="name"
          label="Asset Name"
          required
          :rules="[v => !!v || 'Name is required']"
        ></v-text-field>
        <v-textarea
          v-model="description"
          label="Description"
          required
          :rules="[v => !!v || 'Description is required']"
        ></v-textarea>
        <v-text-field
          v-model="tagsInput"
          label="Tags (comma-separated)"
          hint="Enter tags separated by commas, e.g., tag1, tag2, tag3"
        ></v-text-field>
        <v-file-input
          v-model="imageFile"
          label="Asset Image"
          accept="image/*"
          required
          :rules="[v => !!v || 'Image is required']"
        ></v-file-input>
        <v-text-field v-model="gitlabLink" label="GitLab Repo Link"></v-text-field>
        <v-text-field v-model="demoLink" label="Demo Link"></v-text-field>
        <v-text-field v-model="docLink" label="Documentation Link"></v-text-field>
        <v-btn type="submit" color="primary" :loading="loading">Submit Asset</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { getAuth } from 'firebase/auth';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
  
  export default {
    setup() {
      const name = ref('');
      const description = ref('');
      const tagsInput = ref('');
      const imageFile = ref(null);
      const gitlabLink = ref('');
      const demoLink = ref('');
      const docLink = ref('');
      const loading = ref(false);
  
      const submitAsset = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          alert('Please log in to submit an asset.');
          return;
        }
  
        loading.value = true;
        try {
          const storage = getStorage();
          const db = getFirestore();
  
          // Process tags
          const tags = tagsInput.value
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag);
  
          // Create search terms (name + tags)
          const searchTerms = [
            name.value.toLowerCase(),
            ...tags,
          ].filter(term => term);
  
          // Upload image to Firebase Storage
          const imageRef = storageRef(storage, `assets/${user.uid}/${imageFile.value.name}`);
          await uploadBytes(imageRef, imageFile.value);
          const imageUrl = await getDownloadURL(imageRef);
  
          // Save asset metadata to Firestore
          await addDoc(collection(db, 'assets'), {
            name: name.value,
            description: description.value,
            tags,
            searchTerms,
            imageUrl,
            gitlabLink: gitlabLink.value || '',
            demoLink: demoLink.value || '',
            docLink: docLink.value || '',
            userId: user.uid,
            views: 0,
            createdAt: new Date(),
          });
  
          // Reset form
          name.value = '';
          description.value = '';
          tagsInput.value = '';
          imageFile.value = null;
          gitlabLink.value = '';
          demoLink.value = '';
          docLink.value = '';
          alert('Asset submitted successfully!');
        } catch (error) {
          console.error('Error submitting asset:', error);
          alert('Failed to submit asset.');
        } finally {
          loading.value = false;
        }
      };
  
      return {
        name,
        description,
        tagsInput,
        imageFile,
        gitlabLink,
        demoLink,
        docLink,
        loading,
        submitAsset,
      };
    },
  };
  </script>