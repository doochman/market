<template>
    <v-card class="pa-6" elevation="2">
      <v-row>
        <!-- Left Column: Details -->
        <v-col cols="12" md="8">
          <v-card-title class="text-h4">{{ asset.name }}</v-card-title>
          <v-card-subtitle class="mt-2">
            <v-chip
              v-for="tag in asset.tags"
              :key="tag"
              color="primary"
              class="ma-1"
              small
            >
              {{ tag }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text>
            <p class="text-body-1">{{ asset.description }}</p>
            <v-divider class="my-4"></v-divider>
            <!-- Links with Text Bars -->
            <v-row v-if="asset.gitlabLink">
              <v-col cols="12" sm="8">
                <v-text-field
                  :value="asset.gitlabLink"
                  label="GitLab Repo Link"
                  readonly
                  dense
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn color="success" :href="asset.gitlabLink" target="_blank">Visit GitLab</v-btn>
              </v-col>
            </v-row>
            <v-row v-if="asset.demoLink">
              <v-col cols="12" sm="8">
                <v-text-field
                  :value="asset.demoLink"
                  label="Demo Link"
                  readonly
                  dense
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn color="success" :href="asset.demoLink" target="_blank">View Demo</v-btn>
              </v-col>
            </v-row>
            <v-row v-if="asset.docLink">
              <v-col cols="12" sm="8">
                <v-text-field
                  :value="asset.docLink"
                  label="Documentation Link"
                  readonly
                  dense
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn color="success" :href="asset.docLink" target="_blank">Read Docs</v-btn>
              </v-col>
            </v-row>
            <!-- Views -->
            <v-chip class="mt-2">{{ asset.views || 0 }} Views</v-chip>
          </v-card-text>
          <!-- Edit/Delete Buttons -->
          <v-card-actions>
            <v-btn v-if="canEdit" color="primary" @click="$emit('edit')" outlined>Edit Asset</v-btn>
            <v-btn v-if="isAdmin" color="error" @click="$emit('delete')" :loading="deleteLoading">Delete Asset</v-btn>
          </v-card-actions>
        </v-col>
        <!-- Right Column: Image -->
        <v-col cols="12" md="4">
          <v-img :src="asset.imageUrl" max-height="300px" contain class="rounded"></v-img>
        </v-col>
      </v-row>
    </v-card>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { getAuth } from 'firebase/auth';
  
  export default {
    props: {
      asset: {
        type: Object,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      deleteLoading: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const auth = getAuth();
      const canEdit = computed(() => {
        const user = auth.currentUser;
        if (!user || !props.asset.userId) return false;
        return user.uid === props.asset.userId || props.isAdmin;
      });
  
      return {
        canEdit,
      };
    },
  };
  </script>