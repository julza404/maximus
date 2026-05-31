export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      topics: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
          is_public?: boolean
          created_at?: string
        }
        Relationships: []
      }
      entries: {
        Row: {
          id: string
          title: string
          slug: string
          content: Json
          topic_id: string | null
          is_public: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: Json
          topic_id?: string | null
          is_public?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: Json
          topic_id?: string | null
          is_public?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'entries_topic_id_fkey'
            columns: ['topic_id']
            isOneToOne: false
            referencedRelation: 'topics'
            referencedColumns: ['id']
          }
        ]
      }
      entry_topics: {
        Row: {
          entry_id: string
          topic_id: string
        }
        Insert: {
          entry_id: string
          topic_id: string
        }
        Update: {
          entry_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'entry_topics_entry_id_fkey'
            columns: ['entry_id']
            isOneToOne: false
            referencedRelation: 'entries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'entry_topics_topic_id_fkey'
            columns: ['topic_id']
            isOneToOne: false
            referencedRelation: 'topics'
            referencedColumns: ['id']
          }
        ]
      }
      reminders: {
        Row: {
          id: string
          title: string
          note: string | null
          remind_at: string
          is_done: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          note?: string | null
          remind_at: string
          is_done?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          note?: string | null
          remind_at?: string
          is_done?: boolean
          created_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          subscription: Json
          created_at: string
        }
        Insert: {
          id?: string
          subscription: Json
          created_at?: string
        }
        Update: {
          id?: string
          subscription?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Topic = Database['public']['Tables']['topics']['Row']
export type Entry = Database['public']['Tables']['entries']['Row']
export type EntryTopic = Database['public']['Tables']['entry_topics']['Row']
export type Reminder = Database['public']['Tables']['reminders']['Row']
