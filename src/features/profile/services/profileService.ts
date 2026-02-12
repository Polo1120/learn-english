import { supabase } from '../../../shared/lib/supabase';
import type { Profile } from '../../../shared/types';

export const profileService = {
    // Get all students
    async getStudents(): Promise<Profile[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .order('full_name', { ascending: true });

        if (error) throw error;
        return data as Profile[];
    },

    // Get a single profile
    async getProfile(id: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Profile;
    }
};
