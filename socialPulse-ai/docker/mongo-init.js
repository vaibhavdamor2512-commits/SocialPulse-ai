// ══════════════════════════════════════════════════════════════════════════════
//  SocialPulse AI — MongoDB Initialisation Script
//  Runs once when the mongo container is first created.
//  Creates the database, collections, and indexes.
// ══════════════════════════════════════════════════════════════════════════════

db = db.getSiblingDB('socialpulse');

// ── Collections & indexes ──────────────────────────────────────────────────────

// users
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ created_at: -1 });

// posts
db.createCollection('posts');
db.posts.createIndex({ user_id: 1, platform: 1 });
db.posts.createIndex({ published_at: -1 });
db.posts.createIndex({ hashtags: 1 });

// analytics_snapshots
db.createCollection('analytics_snapshots');
db.analytics_snapshots.createIndex({ user_id: 1, platform: 1, date: -1 }, { unique: true });

// campaigns
db.createCollection('campaigns');
db.campaigns.createIndex({ user_id: 1, status: 1 });
db.campaigns.createIndex({ start_date: -1 });

// competitors
db.createCollection('competitors');
db.competitors.createIndex({ user_id: 1 });

// ai_conversations
db.createCollection('ai_conversations');
db.ai_conversations.createIndex({ user_id: 1, created_at: -1 });

// notifications
db.createCollection('notifications');
db.notifications.createIndex({ user_id: 1, read: 1 });
db.notifications.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 2592000 }  // TTL: 30 days
);

print('SocialPulse AI — MongoDB initialised successfully.');
