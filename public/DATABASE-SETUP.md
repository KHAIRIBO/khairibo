## How to Upload Database Schema to Supabase

Follow these steps to set up your database:

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com
2. Sign in to your account
3. Select your project: `jakurlvpoztwzsgpukja`

### Step 2: Open SQL Editor
1. In the left sidebar, click on **SQL Editor**
2. Click the **New Query** button
3. You'll see a blank SQL editor

### Step 3: Copy and Paste Schema
1. Open the file `database-schema.sql` from your project folder
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click the **Run** button (or press `Ctrl+Enter`)
5. Wait for confirmation - you should see "Success" messages

### Step 4: Add Sample Data (Optional)
1. Create a new query in SQL Editor
2. Open the file `sample-data.sql`
3. Copy ALL the SQL code
4. Paste it into the new Supabase SQL Editor query
5. Click **Run**

### Step 5: Verify Your Tables
1. Go to **Table Editor** in the left sidebar
2. You should see all these tables:
   - projects
   - about
   - contacts
   - contact_submissions
   - blog_posts

3. Click on each table to see your data

### Step 6: Set Permissions (If Needed)
If you want to add more data through the web admin:
1. Go to **Authentication** in the sidebar
2. Enable **Anonymous Sign-ups** if you want public access to insert data
3. Your Row Level Security (RLS) policies are already set up

### Step 7: Test Your App
1. Run your app: `npm start`
2. Open http://localhost:3000
3. Navigate to `/projects`, `/about`, `/contacts`
4. Your data should appear!

## Troubleshooting

**Tables not showing?**
- Refresh the page
- Check that no SQL errors appeared

**Data not appearing in app?**
- Make sure you ran `npm install` after adding Supabase
- Check browser console for errors (F12)
- Verify your Supabase URL and key in `js/supabase.js`

**Permission errors?**
- Go to **Authentication** → **Policies**
- Make sure RLS policies are correctly set
- The schema file already creates the correct policies

## Customize Sample Data

Edit `sample-data.sql` to:
- Change project titles and descriptions to YOUR projects
- Update the about section with YOUR bio
- Add YOUR social media links
- Replace placeholder images with real image URLs

Then re-run the sample data script to insert your custom data.
