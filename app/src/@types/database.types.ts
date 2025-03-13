export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      address: {
        Row: {
          avenue: string | null
          building_number: string | null
          country: string
          created_at: string | null
          display_name: string
          district: string | null
          door_number: string | null
          floor_number: string | null
          id: string
          neighborhood: string | null
          phone: string | null
          postal_code: string | null
          province: string
          street: string | null
          tenant_id: string
        }
        Insert: {
          avenue?: string | null
          building_number?: string | null
          country: string
          created_at?: string | null
          display_name: string
          district?: string | null
          door_number?: string | null
          floor_number?: string | null
          id?: string
          neighborhood?: string | null
          phone?: string | null
          postal_code?: string | null
          province: string
          street?: string | null
          tenant_id: string
        }
        Update: {
          avenue?: string | null
          building_number?: string | null
          country?: string
          created_at?: string | null
          display_name?: string
          district?: string | null
          door_number?: string | null
          floor_number?: string | null
          id?: string
          neighborhood?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string
          street?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      client: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string | null
          identity_number: string
          nationality: string | null
          phone: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string | null
          identity_number: string
          nationality?: string | null
          phone?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string | null
          identity_number?: string
          nationality?: string | null
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      client_address: {
        Row: {
          address_id: string
          client_id: string
        }
        Insert: {
          address_id: string
          client_id: string
        }
        Update: {
          address_id?: string
          client_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_address_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_address_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      permission: {
        Row: {
          bypass: boolean | null
          command: Database["public"]["Enums"]["permission_command"]
          condition: string | null
          created_at: string | null
          description: string | null
          error_message: string | null
          group_name: string
          id: string
          kind: Database["public"]["Enums"]["permission_kind"]
          resource_condition: string | null
          resource_name: string
          throws_error: boolean | null
        }
        Insert: {
          bypass?: boolean | null
          command: Database["public"]["Enums"]["permission_command"]
          condition?: string | null
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          group_name: string
          id?: string
          kind: Database["public"]["Enums"]["permission_kind"]
          resource_condition?: string | null
          resource_name: string
          throws_error?: boolean | null
        }
        Update: {
          bypass?: boolean | null
          command?: Database["public"]["Enums"]["permission_command"]
          condition?: string | null
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          group_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["permission_kind"]
          resource_condition?: string | null
          resource_name?: string
          throws_error?: boolean | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string | null
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_vendor_stats"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_category: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_category_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          brand: string | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          tenant_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          tenant_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permission: {
        Row: {
          created_at: string | null
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permission_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permission_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
        ]
      }
      role: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_default: boolean | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_default?: boolean | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_default?: boolean | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      stock: {
        Row: {
          available: number | null
          barcode: string | null
          cost: number
          created_at: string | null
          currency_code: string
          details: string | null
          id: string
          product_id: string
          quantity: number
          serial_number: string | null
          tenant_id: string
          unit_cost: number | null
          used: number
          vendor: string | null
        }
        Insert: {
          available?: number | null
          barcode?: string | null
          cost: number
          created_at?: string | null
          currency_code?: string
          details?: string | null
          id?: string
          product_id: string
          quantity?: number
          serial_number?: string | null
          tenant_id: string
          unit_cost?: number | null
          used?: number
          vendor?: string | null
        }
        Update: {
          available?: number | null
          barcode?: string | null
          cost?: number
          created_at?: string | null
          currency_code?: string
          details?: string | null
          id?: string
          product_id?: string
          quantity?: number
          serial_number?: string | null
          tenant_id?: string
          unit_cost?: number | null
          used?: number
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_vendor_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant: {
        Row: {
          created_at: string | null
          display_name: string
          email: string | null
          id: string
          parent_id: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          email?: string | null
          id?: string
          parent_id?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          email?: string | null
          id?: string
          parent_id?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_user: {
        Row: {
          created_at: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_user_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_user_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role: {
        Row: {
          created_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      product_brands: {
        Row: {
          display_name: string | null
        }
        Relationships: []
      }
      stock_product_stat: {
        Row: {
          available_quantity: number | null
          average_unit_cost: number | null
          brand: string | null
          display_name: string | null
          total_cost: number | null
          total_quantity: number | null
          used_quantity: number | null
        }
        Relationships: []
      }
      stock_vendor_stats: {
        Row: {
          average_cost: number | null
          average_unit_cost: number | null
          product_id: string | null
          total_available: number | null
          total_cost: number | null
          total_product: number | null
          total_quantity: number | null
          total_used: number | null
          vendor: string | null
        }
        Relationships: []
      }
      stock_vendor: {
        Row: {
          display_name: string | null
        }
        Relationships: []
      }
      stock_view: {
        Row: {
          available: number | null
          barcode: string | null
          brand: string | null
          cost: number | null
          created_at: string | null
          currency_code: string | null
          details: string | null
          display_name: string | null
          id: string | null
          product_id: string | null
          quantity: number | null
          serial_number: string | null
          tenant_id: string | null
          unit_cost: number | null
          used: number | null
          vendor: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_vendor_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      throw_rls_policy_error: {
        Args: {
          message: string
        }
        Returns: boolean
      }
    }
    Enums: {
      permission_command: "select" | "insert" | "update" | "delete"
      permission_kind: "read" | "create" | "modify"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

