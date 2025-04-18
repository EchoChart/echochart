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
          city: string
          country: string
          created_at: string | null
          details: string | null
          display_name: string
          district: string
          id: string
          tenant_id: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string | null
          details?: string | null
          display_name: string
          district: string
          id?: string
          tenant_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          details?: string | null
          display_name?: string
          district?: string
          id?: string
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
      audit_log: {
        Row: {
          correlation_id: string | null
          created_at: string | null
          id: string
          old_data: Json | null
          operation: string
          reverted: boolean | null
          reverted_by: string | null
          row_data: Json | null
          table_name: string
          table_schema: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string | null
          id?: string
          old_data?: Json | null
          operation: string
          reverted?: boolean | null
          reverted_by?: string | null
          row_data?: Json | null
          table_name: string
          table_schema: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string | null
          id?: string
          old_data?: Json | null
          operation?: string
          reverted?: boolean | null
          reverted_by?: string | null
          row_data?: Json | null
          table_name?: string
          table_schema?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_reverted_by_fkey"
            columns: ["reverted_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client: {
        Row: {
          birth_date: string
          created_at: string | null
          display_name: string
          email: string | null
          gender: string | null
          id: string
          identity: string
          nationality: string | null
          phone: string | null
          tenant_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string | null
          display_name: string
          email?: string | null
          gender?: string | null
          id?: string
          identity: string
          nationality?: string | null
          phone?: string | null
          tenant_id: string
        }
        Update: {
          birth_date?: string
          created_at?: string | null
          display_name?: string
          email?: string | null
          gender?: string | null
          id?: string
          identity?: string
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
          created_at: string | null
          id: string | null
        }
        Insert: {
          address_id: string
          client_id: string
          created_at?: string | null
          id?: string | null
        }
        Update: {
          address_id?: string
          client_id?: string
          created_at?: string | null
          id?: string | null
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
            foreignKeyName: "client_address_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "client_address_view"
            referencedColumns: ["address_id"]
          },
          {
            foreignKeyName: "client_address_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_address_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_address_view"
            referencedColumns: ["client_id"]
          },
        ]
      }
      permission: {
        Row: {
          bypass: boolean | null
          command: Database["public"]["Enums"]["permission_command"]
          condition: string | null
          created_at: string | null
          details: string | null
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
          details?: string | null
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
          details?: string | null
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
      product: {
        Row: {
          brand: string | null
          created_at: string | null
          details: string | null
          display_name: string
          id: string
          tenant_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          details?: string | null
          display_name: string
          id?: string
          tenant_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          details?: string | null
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
      product_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string | null
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string | null
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string | null
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
            referencedRelation: "stock_vendor_stat"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_category: {
        Row: {
          created_at: string | null
          details: string | null
          display_name: string
          id: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          display_name: string
          id?: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
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
      role: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
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
      role_permission: {
        Row: {
          created_at: string | null
          id: string | null
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string | null
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
      sales: {
        Row: {
          amount: number
          assigned_user_id: string
          attributes: Json | null
          bid: number | null
          bid_discount: number | null
          created_at: string | null
          delivery_status: string | null
          details: string | null
          id: string
          payment_type: string | null
          product_id: string
          record_status: string
          record_type: string
          tenant_id: string
        }
        Insert: {
          amount: number
          assigned_user_id: string
          attributes?: Json | null
          bid?: number | null
          bid_discount?: number | null
          created_at?: string | null
          delivery_status?: string | null
          details?: string | null
          id?: string
          payment_type?: string | null
          product_id: string
          record_status: string
          record_type: string
          tenant_id: string
        }
        Update: {
          amount?: number
          assigned_user_id?: string
          attributes?: Json | null
          bid?: number | null
          bid_discount?: number | null
          created_at?: string | null
          delivery_status?: string | null
          details?: string | null
          id?: string
          payment_type?: string | null
          product_id?: string
          record_status?: string
          record_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_vendor_stat"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      stock: {
        Row: {
          barcode: string | null
          created_at: string | null
          currency_code: string
          details: string | null
          id: string
          product_id: string
          quantity: number
          serial_number: string | null
          stock_date: string | null
          tenant_id: string
          total_cost: number | null
          unit_cost: number
          vendor: string | null
        }
        Insert: {
          barcode?: string | null
          created_at?: string | null
          currency_code?: string
          details?: string | null
          id?: string
          product_id: string
          quantity?: number
          serial_number?: string | null
          stock_date?: string | null
          tenant_id: string
          total_cost?: number | null
          unit_cost: number
          vendor?: string | null
        }
        Update: {
          barcode?: string | null
          created_at?: string | null
          currency_code?: string
          details?: string | null
          id?: string
          product_id?: string
          quantity?: number
          serial_number?: string | null
          stock_date?: string | null
          tenant_id?: string
          total_cost?: number | null
          unit_cost?: number
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
            referencedRelation: "stock_vendor_stat"
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
      tenant_owner: {
        Row: {
          created_at: string | null
          id: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_owner_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_owner_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_user: {
        Row: {
          created_at: string | null
          id: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string | null
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
      user_role: {
        Row: {
          created_at: string | null
          id: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string | null
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
    }
    Views: {
      audit_log_distinct: {
        Row: {
          correlation_id: string | null
          created_at: string | null
          id: string | null
          old_data: Json | null
          operation: string | null
          reverted: boolean | null
          reverted_by: string | null
          row_data: Json | null
          table_name: string | null
          table_schema: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_reverted_by_fkey"
            columns: ["reverted_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_address_view: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_created_at: string | null
          address_details: string | null
          address_display_name: string | null
          address_district: string | null
          address_id: string | null
          address_tenant_id: string | null
          client_created_at: string | null
          client_display_name: string | null
          client_email: string | null
          client_id: string | null
          client_identity: string | null
          client_nationality: string | null
          client_phone: string | null
          client_tenant_id: string | null
          id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "address_tenant_id_fkey"
            columns: ["address_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tenant_id_fkey"
            columns: ["client_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      product_brands: {
        Row: {
          display_name: string | null
        }
        Relationships: []
      }
      stock_product_stat: {
        Row: {
          average_total_cost: number | null
          brand: string | null
          display_name: string | null
          total_cost: number | null
          total_quantity: number | null
        }
        Relationships: []
      }
      stock_vendor: {
        Row: {
          display_name: string | null
        }
        Relationships: []
      }
      stock_vendor_stat: {
        Row: {
          average_cost: number | null
          average_total_cost: number | null
          product_id: string | null
          total_cost: number | null
          total_product: number | null
          total_quantity: number | null
          vendor: string | null
        }
        Relationships: []
      }
      stock_view: {
        Row: {
          available_quantity: number | null
          barcode: string | null
          brand: string | null
          created_at: string | null
          currency_code: string | null
          details: string | null
          display_name: string | null
          id: string | null
          product_id: string | null
          quantity: number | null
          serial_number: string | null
          stock_date: string | null
          tenant_id: string | null
          total_cost: number | null
          unit_cost: number | null
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
            referencedRelation: "stock_vendor_stat"
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
      revert_audit_log: {
        Args: {
          target_correlation_id: string
        }
        Returns: undefined
      }
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

