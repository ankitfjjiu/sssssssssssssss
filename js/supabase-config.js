// Supabase Configuration
const SUPABASE_URL = 'https://zebzxaszsofarlptmrza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYnp4YXN6c29mYXJscHRtcnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODg0OTQsImV4cCI6MjA3NTg2NDQ5NH0.EGA6zKdU4coJqMVQEPSrnhoJbuw2IRLPkjpTPyHYiUk';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase Database Functions
class SupabaseDB {
    
    // Get admin password from database
    static async getAdminPassword() {
        try {
            const { data, error } = await supabaseClient
                .from('admin_settings')
                .select('setting_value')
                .eq('setting_key', 'admin_password')
                .single();
            
            if (error) {
                console.error('Error fetching admin password:', error);
                return 'admin123'; // fallback
            }
            
            return data?.setting_value || 'admin123';
        } catch (err) {
            console.error('Error:', err);
            return 'admin123'; // fallback
        }
    }
    
    // Update admin password
    static async updateAdminPassword(newPassword) {
        try {
            const { data, error } = await supabaseClient
                .from('admin_settings')
                .update({ 
                    setting_value: newPassword,
                    updated_at: new Date().toISOString()
                })
                .eq('setting_key', 'admin_password');
            
            if (error) {
                console.error('Error updating password:', error);
                return false;
            }
            
            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    }
    
    // Save generated URL to database
    static async saveGeneratedUrl(urlData) {
        try {
            const { data, error } = await supabaseClient
                .from('generated_urls')
                .insert([{
                    id: urlData.id,
                    title: urlData.title,
                    slug: urlData.slug,
                    target_url: urlData.targetUrl,
                    created_at: urlData.createdAt
                }]);
            
            if (error) {
                console.error('Error saving URL:', error);
                return false;
            }
            
            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    }
    
    // Get all generated URLs
    static async getAllUrls() {
        try {
            const { data, error } = await supabaseClient
                .from('generated_urls')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching URLs:', error);
                return [];
            }
            
            // Convert to format expected by frontend
            return data.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                targetUrl: item.target_url,
                createdAt: item.created_at
            }));
        } catch (err) {
            console.error('Error:', err);
            return [];
        }
    }
    
    // Get single URL by ID
    static async getUrlById(id) {
        try {
            const { data, error } = await supabaseClient
                .from('generated_urls')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error('Error fetching URL:', error);
                return null;
            }
            
            return {
                id: data.id,
                title: data.title,
                slug: data.slug,
                targetUrl: data.target_url,
                createdAt: data.created_at
            };
        } catch (err) {
            console.error('Error:', err);
            return null;
        }
    }
    
    // Delete URL (if needed in future)
    static async deleteUrl(id) {
        try {
            const { data, error } = await supabaseClient
                .from('generated_urls')
                .delete()
                .eq('id', id);
            
            if (error) {
                console.error('Error deleting URL:', error);
                return false;
            }
            
            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    }
    
    // Test database connection
    static async testConnection() {
        try {
            const { data, error } = await supabaseClient
                .from('admin_settings')
                .select('count')
                .limit(1);
            
            if (error) {
                console.error('Database connection failed:', error);
                return false;
            }
            
            console.log('✅ Supabase connection successful');
            return true;
        } catch (err) {
            console.error('Database connection error:', err);
            return false;
        }
    }
}

// Export for use in other files
window.SupabaseDB = SupabaseDB;
