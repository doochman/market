<template>
    <div class="comments-section">
      <h2 class="text-h5 font-weight-semibold mb-6">Comments</h2>
      <!-- Comment Form (Sticky) -->
      <div v-if="user" class="sticky top-0 z-10 bg-gray-100 py-4">
        <v-card class="pa-4 mb-6" elevation="2" rounded="lg">
          <v-form ref="commentForm" @submit.prevent="submitComment(null)">
            <v-textarea
              v-model="newComment"
              placeholder="Add a comment..."
              rows="3"
              auto-grow
              outlined
              dense
              class="comment-input"
              :rules="[v => !!v || 'Comment is required']"
            ></v-textarea>
            <v-btn
              color="#3B82F6"
              dark
              type="submit"
              :loading="commentLoading"
              class="mt-2"
              depressed
              rounded
            >
              Post Comment
            </v-btn>
          </v-form>
        </v-card>
      </div>
      <v-alert v-else type="info" class="mb-6" outlined rounded="lg">
        Please <a @click="login" class="text-decoration-underline text-blue-500">log in</a> to add a comment.
      </v-alert>
  
      <!-- Comments List -->
      <div class="space-y-4">
        <v-card
          v-for="comment in topLevelComments"
          :key="comment.id"
          class="comment-thread pa-4"
          elevation="2"
          rounded="lg"
        >
          <v-list-item three-line>
            <template #prepend>
              <v-avatar size="40" color="#EC4899">
                <span class="text-white text-lg font-medium">
                  {{ comment.displayName ? comment.displayName[0].toUpperCase() : comment.userEmail[0].toUpperCase() }}
                </span>
              </v-avatar>
            </template>
            <v-list-item-content>
              <v-list-item-title class="text-subtitle-1 font-weight-semibold mb-1">
                <router-link :to="'/profile/' + comment.userId" class="text-gray-800 text-decoration-none hover:underline">
                  {{ comment.displayName || comment.userEmail }}
                </router-link>
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-1 text-gray-700">
                {{ comment.text }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action class="action-icons">
              <v-btn
                v-if="user"
                text
                small
                color="#3B82F6"
                @click.stop="toggleReplyForm(comment.id)"
                class="text-sm"
              >
                Reply
              </v-btn>
              <v-btn
                v-if="isAdmin"
                text
                small
                color="#EF4444"
                @click.stop="deleteComment(comment.id)"
                class="text-sm"
              >
                Delete
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <!-- Replies Toggle -->
          <div v-if="comment.replyCount > 0" class="d-flex align-center mt-2 ml-12">
            <v-btn
              text
              small
              color="#3B82F6"
              @click="toggleReplies(comment.id)"
              class="text-sm"
            >
              {{ expandedReplies[comment.id] ? 'Hide Replies' : `Show Replies (${comment.replyCount})` }}
            </v-btn>
          </div>
          <!-- Reply Form -->
          <v-card
            v-if="replyingTo === comment.id"
            class="mt-4 ml-12 pa-4"
            elevation="1"
            rounded="lg"
          >
            <v-form ref="replyForm" @submit.prevent="submitComment(comment.id)">
              <v-textarea
                v-model="newReply"
                placeholder="Write a reply..."
                rows="2"
                auto-grow
                outlined
                dense
                class="comment-input"
                :rules="[v => !!v || 'Reply is required']"
              ></v-textarea>
              <v-btn
                color="#3B82F6"
                dark
                type="submit"
                :loading="commentLoading"
                class="mt-2"
                depressed
                rounded
              >
                Post Reply
              </v-btn>
              <v-btn
                text
                small
                color="#4B5563"
                @click="toggleReplyForm(null)"
                class="ml-2 text-sm"
              >
                Cancel
              </v-btn>
            </v-form>
          </v-card>
          <!-- Replies -->
          <div v-if="expandedReplies[comment.id]" class="mt-4 space-y-4 animate-fade-in">
            <v-card
              v-for="reply in comment.replies"
              :key="reply.id"
              class="reply-thread pa-4 ml-8"
              elevation="1"
              rounded="lg"
            >
              <v-list-item three-line>
                <template #prepend>
                  <v-avatar size="32" color="#EC4899">
                    <span class="text-white text-sm font-medium">
                      {{ reply.displayName ? reply.displayName[0].toUpperCase() : reply.userEmail[0].toUpperCase() }}
                    </span>
                  </v-avatar>
                </template>
                <v-list-item-content>
                  <v-list-item-title class="text-subtitle-2 font-weight-semibold mb-1">
                    <router-link :to="'/profile/' + reply.userId" class="text-gray-800 text-decoration-none hover:underline">
                      {{ reply.displayName || reply.userEmail }}
                    </router-link>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text-gray-700">
                    {{ reply.text }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action class="action-icons">
                  <v-btn
                    v-if="user"
                    text
                    small
                    color="#3B82F6"
                    @click="toggleReplyForm(reply.id)"
                    class="text-sm"
                  >
                    Reply
                  </v-btn>
                  <v-btn
                    v-if="isAdmin"
                    text
                    small
                    color="#EF4444"
                    @click="deleteComment(reply.id)"
                    class="text-sm"
                  >
                    Delete
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-card>
          </div>
        </v-card>
        <v-card v-if="!topLevelComments.length" class="pa-4 text-center" flat rounded="lg">
          <p class="text-body-1 text-gray-600">No comments yet. Be the first to comment!</p>
        </v-card>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
  import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, getDocs, query, where, getDoc } from 'firebase/firestore';
  
  export default {
    props: {
      collectionPath: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const auth = getAuth();
      const db = getFirestore();
      const user = ref(auth.currentUser);
      const isAdmin = ref(false);
      const comments = ref([]);
      const newComment = ref('');
      const newReply = ref('');
      const commentLoading = ref(false);
      const replyingTo = ref(null);
      const expandedReplies = ref({});
      const commentForm = ref(null);
      const replyForm = ref(null);
      let unsubscribe = null;
  
      auth.onAuthStateChanged(async u => {
        user.value = u;
        if (u) {
          const profileDoc = await getDoc(doc(db, 'profiles', u.uid));
          isAdmin.value = profileDoc.exists() && profileDoc.data().role === 'admin';
        } else {
          isAdmin.value = false;
        }
      });
  
      // Fetch top-level comments and reply counts
      const topLevelComments = computed(() => {
        const commentMap = new Map();
        comments.value.forEach(comment => {
          if (!comment.parentId) {
            commentMap.set(comment.id, { ...comment, replies: [], replyCount: 0 });
          }
        });
        // Count replies for each top-level comment
        comments.value.forEach(comment => {
          if (comment.parentId && commentMap.has(comment.parentId)) {
            commentMap.get(comment.parentId).replyCount += 1;
            if (expandedReplies.value[comment.parentId]) {
              commentMap.get(comment.parentId).replies.push(comment);
            }
          }
        });
        return Array.from(commentMap.values()).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
  
      const submitComment = async (parentId) => {
        if (!auth.currentUser) {
          alert('Please log in to comment.');
          return;
        }
        commentLoading.value = true;
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', auth.currentUser.uid));
          const profile = profileDoc.exists() ? profileDoc.data() : {};
          await addDoc(collection(db, props.collectionPath), {
            text: parentId ? newReply.value : newComment.value,
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            displayName: profile.displayName || auth.currentUser.email,
            avatarUrl: profile.avatarUrl || '',
            name: profile.name || '',
            surname: profile.surname || '',
            parentId: parentId || null,
            createdAt: new Date().toISOString(),
          });
          newComment.value = '';
          newReply.value = '';
          replyingTo.value = null;
          // Reset form validation
          if (parentId && replyForm.value) {
            replyForm.value.resetValidation();
          } else if (commentForm.value) {
            commentForm.value.resetValidation();
          }
        } catch (error) {
          console.error('Error submitting comment:', error);
          alert('Failed to submit comment.');
        } finally {
          commentLoading.value = false;
        }
      };
  
      const deleteComment = async (commentId) => {
        if (!isAdmin.value) return;
        try {
          await deleteDoc(doc(db, props.collectionPath, commentId));
          alert('Comment deleted successfully.');
        } catch (error) {
          console.error('Error deleting comment:', error);
          alert('Failed to delete comment.');
        }
      };
  
      const toggleReplyForm = (commentId) => {
        replyingTo.value = replyingTo.value === commentId ? null : commentId;
        newReply.value = '';
        if (replyForm.value) {
          replyForm.value.resetValidation();
        }
      };
  
      const toggleReplies = async (commentId) => {
        if (expandedReplies.value[commentId]) {
          expandedReplies.value = { ...expandedReplies.value, [commentId]: false };
        } else {
          // Fetch replies for the comment
          const q = query(
            collection(db, props.collectionPath),
            where('parentId', '==', commentId)
          );
          const snapshot = await getDocs(q);
          const newReplies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Update comments with fetched replies
          comments.value = [
            ...comments.value.filter(c => c.parentId !== commentId),
            ...newReplies,
          ];
          expandedReplies.value = { ...expandedReplies.value, [commentId]: true };
        }
      };
  
      const login = async () => {
        try {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
        } catch (error) {
          console.error('Login error:', error);
          alert('Failed to log in.');
        }
      };
  
      onMounted(() => {
        // Fetch top-level comments
        const q = query(collection(db, props.collectionPath));
        unsubscribe = onSnapshot(q, snapshot => {
          comments.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        });
      });
  
      onUnmounted(() => {
        if (unsubscribe) unsubscribe();
      });
  
      return {
        user,
        isAdmin,
        comments,
        newComment,
        newReply,
        commentLoading,
        replyingTo,
        expandedReplies,
        commentForm,
        replyForm,
        topLevelComments,
        submitComment,
        deleteComment,
        toggleReplyForm,
        toggleReplies,
        login,
      };
    },
  };
  </script>
  
  <style scoped>
  .comments-section {
    width: 100%; /* Match parent container width */
  }
  .comment-thread {
    background-color: #FFFFFF;
    transition: all 0.3s ease;
  }
  .comment-thread:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .reply-thread {
    background-color: #FFFFFF;
    border-left: 2px solid #E5E7EB;
    transition: all 0.3s ease;
  }
  .reply-thread:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .bg-gray-100 {
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
  .text-red-500 {
    color: #EF4444;
  }
  .text-red-500:hover {
    color: #DC2626;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .font-weight-semibold {
    font-weight: 600;
  }
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .comment-input {
    font-family: 'Roboto', sans-serif;
  }
  .action-icons {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sticky {
    position: sticky;
  }
  </style>