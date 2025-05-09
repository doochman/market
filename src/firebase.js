import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };

   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);
   const db = getFirestore(app);
   const storage = getStorage(app);

   // Connect to emulators if running locally
   if (location.hostname === "localhost") {
     connectAuthEmulator(auth, "http://localhost:9099");
     connectFirestoreEmulator(db, "localhost", 8080);
     connectStorageEmulator(storage, "localhost", 9199);
   }

   export { auth, db, storage };