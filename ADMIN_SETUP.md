# Admin Setup Guide

## How to Create an Admin User

### Step 1: Sign Up in the App

1. Start your app:
   ```bash
   npm run web
   ```

2. Go to the signup page
3. Create an account with your email and password
4. After signing up, you'll be logged in as a "viewer" (read-only)

### Step 2: Get Your User ID

1. Go to Supabase Dashboard: https://hitmhxjcgllpclsbxtdd.supabase.co
2. Click **Authentication** → **Users** in the left sidebar
3. Find your email in the list
4. Click on your user to see details
5. Copy your **User UID** (it's a long UUID like `a1b2c3d4-e5f6-...`)

### Step 3: Make Yourself Admin

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Paste this SQL (replace `YOUR_USER_ID` with the ID you copied):

```sql
UPDATE public.users
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';
```

4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
5. You should see "Success. 1 row updated"

### Step 4: Verify Admin Access

1. Refresh your app (or log out and log back in)
2. You should now see:
   - "+ New" button on Customers page
   - Ability to create, edit, and delete customers
   - Full admin functionality

## Admin Features

Once you're admin, you can:

✅ **Create customers** - Click "+ New" button
✅ **Edit customers** - Click on a customer to view/edit
✅ **Delete customers** - Available in customer detail page
✅ **View outstanding amounts** - Shown for each customer
✅ **Full access** - All features are available

## Test Admin Login

After setting up admin:

1. **Add a Customer:**
   - Click "+ New" button
   - Fill in Customer ID (e.g., CUST001)
   - Fill in Name (required)
   - Add optional fields (phone, email, address, etc.)
   - Click "Create"

2. **View Outstanding Balance:**
   - Customers list shows outstanding balance for each customer
   - Customer detail page shows full balance information

3. **Edit Customer:**
   - Click on any customer
   - Click "Edit" button
   - Make changes and save

## Troubleshooting

**Can't see "+ New" button?**
- Make sure you ran the UPDATE SQL query
- Try logging out and logging back in
- Refresh the page

**Still showing as viewer?**
- Double-check the User ID in the SQL query
- Verify the SQL query ran successfully
- Check browser console for errors

**Outstanding balance not showing?**
- Outstanding balance is ₹0 if customer has no invoices
- Balance is calculated from unpaid invoices minus payments
- Create an invoice for the customer to see balance

## Creating Additional Admin Users

To make another user admin:

1. They sign up in the app
2. You get their User ID from Supabase → Authentication → Users
3. Run the same UPDATE SQL query with their User ID

