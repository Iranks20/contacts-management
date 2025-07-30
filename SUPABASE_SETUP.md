# Supabase Setup Guide

This guide will help you set up Supabase for the Contact Management System.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter a project name (e.g., "campaign-contacts")
6. Enter a database password (save this securely)
7. Choose a region close to your users
8. Click "Create new project"

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Update Your Configuration

1. Open `src/lib/supabase.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
const supabaseUrl = 'YOUR_ACTUAL_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_ACTUAL_SUPABASE_ANON_KEY'
```

For example:
```typescript
const supabaseUrl = 'https://abc123def456.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## 4. Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query and run the following SQL:

```sql
-- Create the contacts table
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  number VARCHAR(20) NOT NULL,
  district VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_contacts_telephone ON contacts(telephone);
CREATE INDEX idx_contacts_district ON contacts(district);
CREATE INDEX idx_contacts_position ON contacts(position);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for demo purposes)
-- In production, you should create more restrictive policies
CREATE POLICY "Allow all operations" ON contacts
  FOR ALL USING (true);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 5. Install Dependencies

Run the following command to install the Supabase client:

```bash
npm install
```

## 6. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your application
3. Try adding a new contact using the "Add New Contact" button
4. Check your Supabase dashboard → **Table Editor** → **contacts** to see if the data appears

## 7. Import/Export Functionality

The system supports importing contacts from CSV files. The expected format is:

```csv
Name,Telephone,Number,District,Position
"John Doe","+256701234567","+256781234567","Kampala Central","Coordinator"
"Jane Smith","+256702345678","+256782345678","Wakiso","Volunteer"
```

## 8. Security Considerations

For production use, consider:

1. **Row Level Security (RLS)**: Create more restrictive policies based on user authentication
2. **Input Validation**: The application includes client-side validation, but consider server-side validation
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Environment Variables**: Store credentials in environment variables instead of hardcoding them

## 9. Environment Variables (Recommended)

For better security, use environment variables:

1. Create a `.env` file in your project root:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Update `src/lib/supabase.ts`:
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
   ```

3. Add `.env` to your `.gitignore` file

## 10. Troubleshooting

### Common Issues:

1. **"Error loading contacts"**: Check your Supabase credentials and ensure the table exists
2. **"Network error"**: Verify your Supabase URL is correct
3. **"Permission denied"**: Check your RLS policies in Supabase
4. **Import not working**: Ensure your CSV file follows the expected format

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the browser console for error messages
- Verify your table structure matches the expected schema

## 11. Database Schema

The contacts table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key, auto-incrementing |
| name | VARCHAR(255) | Contact's full name |
| telephone | VARCHAR(20) | Primary phone number (+256XXXXXXXXX format) |
| number | VARCHAR(20) | Secondary phone number (+256XXXXXXXXX format) |
| district | VARCHAR(100) | District name |
| position | VARCHAR(100) | Position/role |
| created_at | TIMESTAMP | When the record was created |
| updated_at | TIMESTAMP | When the record was last updated |

## 12. Features Implemented

✅ **CRUD Operations**: Create, Read, Update, Delete contacts  
✅ **Search & Filter**: Search by name/phone, filter by district/position  
✅ **Bulk Operations**: Select multiple contacts for deletion  
✅ **Import/Export**: CSV import and export functionality  
✅ **Form Validation**: Client-side validation with error messages  
✅ **Real-time Updates**: Automatic refresh after operations  
✅ **Loading States**: Visual feedback during operations  
✅ **Error Handling**: User-friendly error messages  

Your contact management system is now ready to use with Supabase! 