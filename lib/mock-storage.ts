import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json')
const STORIES_FILE = path.join(DATA_DIR, 'stories.json')
const GALLERIES_FILE = path.join(DATA_DIR, 'galleries.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize files if they don't exist
if (!fs.existsSync(REQUESTS_FILE)) {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify([]))
}

if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([]))
}

if (!fs.existsSync(STORIES_FILE)) {
  fs.writeFileSync(STORIES_FILE, JSON.stringify([]))
}

if (!fs.existsSync(GALLERIES_FILE)) {
  fs.writeFileSync(GALLERIES_FILE, JSON.stringify([]))
}

export class MockStorage {
  static getRequests(): any[] {
    try {
      const data = fs.readFileSync(REQUESTS_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading requests:', error)
      return []
    }
  }

  static saveRequests(requests: any[]): void {
    try {
      fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2))
    } catch (error) {
      console.error('Error saving requests:', error)
    }
  }

  static getNotifications(): any[] {
    try {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading notifications:', error)
      return []
    }
  }

  static saveNotifications(notifications: any[]): void {
    try {
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2))
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }

  static getStories(): any[] {
    try {
      const data = fs.readFileSync(STORIES_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading stories:', error)
      return []
    }
  }

  static saveStories(stories: any[]): void {
    try {
      fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2))
    } catch (error) {
      console.error('Error saving stories:', error)
    }
  }

  static getGalleries(): any[] {
    try {
      const data = fs.readFileSync(GALLERIES_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading galleries:', error)
      return []
    }
  }

  static saveGalleries(galleries: any[]): void {
    try {
      fs.writeFileSync(GALLERIES_FILE, JSON.stringify(galleries, null, 2))
    } catch (error) {
      console.error('Error saving galleries:', error)
    }
  }
}