// Service Worker for EduSphere PWA
const CACHE_NAME = "edusphere-cache-v1"
const OFFLINE_URL = "offline.html"

// Resources to cache
const RESOURCES_TO_CACHE = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/assets/logo.png",
  "/assets/book-placeholder.png",
  "/assets/avatar-placeholder.png",
  "/assets/forgot-password.png",
  "/assets/animations/gold-sparkle.json",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(RESOURCES_TO_CACHE)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip Supabase API requests
  if (event.request.url.includes("supabase.co")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }

      // Clone the request
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache the fetched resource
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Network failed, serve offline page for HTML requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL)
          }

          // For other requests, just return a simple error
          return new Response("Network error occurred", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          })
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-user-actions") {
    event.waitUntil(syncUserActions())
  }
})

// Function to sync user actions when back online
async function syncUserActions() {
  try {
    const db = await openDB()
    const actions = await db.getAll("offlineActions")

    for (const action of actions) {
      try {
        // Process each action
        await processOfflineAction(action)
        // Remove from IndexedDB if successful
        await db.delete("offlineActions", action.id)
      } catch (error) {
        console.error("Error processing offline action:", error)
      }
    }
  } catch (error) {
    console.error("Error syncing user actions:", error)
  }
}

// Function to process offline actions
async function processOfflineAction(action) {
  // Implementation would depend on the type of action
  // For example, sending a POST request to the server
  return fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body,
  })
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("EduSphereOfflineDB", 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains("offlineActions")) {
        db.createObjectStore("offlineActions", { keyPath: "id" })
      }
    }
  })
}

// Push notification event
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: "/assets/logo.png",
    badge: "/assets/notification-badge.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data.url || "/"))
})
