<template>
    <v-card class="mt-6 pa-6" elevation="2">
      <v-form @submit.prevent="$emit('save')">
        <v-text-field
          v-model="editedAsset.name"
          label="Asset Name"
          required
          :rules="[v => !!v || 'Name is required']"
        ></v-text-field>
        <v-textarea
          v-model="editedAsset.description"
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
          v-model="editedAsset.imageFile"
          label="Asset Image"
          accept="image/*"
          hint="Upload a new image to replace the existing one"
        ></v-file-input>
        <v-text-field v-model="editedAsset.gitlabLink" label="GitLab Repo Link"></v-text-field>
        <v-text-field v-model="editedAsset.demoLink" label="Demo Link"></v-text-field>
        <v-text-field v-model="editedAsset.docLink" label="Documentation Link"></v-text-field>
        <v-btn type="submit" color="primary" :loading="saveLoading">Save Changes</v-btn>
        <v-btn color="error" @click="$emit('cancel')" class="ml-2">Cancel</v-btn>
      </v-form>
    </v-card>
  </template>
  
  <script>
  export default {
    props: {
      asset: {
        type: Object,
        required: true,
      },
      saveLoading: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['save', 'cancel'],
    data() {
      return {
        editedAsset: { ...this.asset, imageFile: null },
        tagsInput: this.asset.tags?.join(', ') || '',
      };
    },
    watch: {
      asset: {
        handler(newAsset) {
          this.editedAsset = { ...newAsset, imageFile: null };
          this.tagsInput = newAsset.tags?.join(', ') || '';
        },
        deep: true,
      },
    },
  };
  </script>