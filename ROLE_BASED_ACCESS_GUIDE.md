# Role-Based Access Control System Documentation

## Overview
Your ManiProject is fully configured with a **role-based access control (RBAC)** system that connects users, admins, and sellers according to their roles.

---

## System Architecture

### 1. **User Roles**
Three main roles are defined in the system:

- **`user`** - Regular customer (default role)
- **`seller`** - Vendor selling products (requires approval)
- **`admin`** - System administrator (full access)

### 2. **Database Connections**

#### User Model (`backend/models/User.js`)
```javascript
{
  role: ['user', 'seller', 'admin'],          // Role assignment
  isSellerApproved: Boolean,                  // Seller approval status
  sellerProfile: ref(SellerProfile),          // Link to seller account
  isActive: Boolean                           // Account status
}
```

#### SellerProfile Model (`backend/models/SellerProfile.js`)
```javascript
{
  user: ref(User),                            // Links back to User
  shopName: String,
  approved: Boolean,                          // Admin approval
  verified: Boolean,                          // Verified badge
  // ... other seller details
}
```

---

## Access Control Flow

### User → Seller Conversion
```
1. User (role: 'user') clicks "Become a Seller"
2. Calls POST /api/sellers/register
3. Creates SellerProfile entry
4. Sets role to 'seller', isSellerApproved: false
5. Admin reviews in Admin Dashboard
6. Admin approves → isSellerApproved: true
7. Seller can now list products
```

### Admin → User Access
```
Admin can:
- View all users
- Approve/Reject sellers
- Manage all products
- Access all orders
- View analytics
- Manage system settings
```

### Seller → Own Products
```
Seller can:
- Create/Edit/Delete own products
- View own analytics
- Process own orders
- Manage own store profile
- Cannot access other sellers' data
```

---

## Backend Route Protection

### Authentication Middleware
```
authMiddleware  → Checks JWT token and loads user
authorizeRoles  → Checks role permission
```

### Protected Routes by Role

#### Admin-Only Routes
```
GET  /api/admin/users                    # List all users
GET  /api/admin/sellers                  # List all sellers
PUT  /api/admin/users/:id                # Update user
PUT  /api/sellers/:id/approve            # Approve seller
PUT  /api/admin/products/:id/approve     # Approve product
GET  /api/admin/orders                   # View all orders
```

#### Seller Routes
```
POST /api/products                       # Create product
PUT  /api/products/:id                   # Update own product
DELETE /api/products/:id                 # Delete own product
GET  /api/sellers/:id/analytics          # Get own analytics
```

#### User Routes
```
POST /api/orders                         # Create order
GET  /api/orders/myorders                # View own orders
POST /api/sellers/register               # Apply to become seller
```

#### Public Routes
```
GET  /api/products                       # Browse all products
GET  /api/sellers/approved/list          # View approved sellers
GET  /api/products/:id                   # View product details
```

---

## Frontend Role-Based Navigation

### PrivateRoute Component (`frontend/src/components/Layout/PrivateRoute.jsx`)
```jsx
<PrivateRoute adminOnly>      // Only admin can access
  <AdminDashboard />
</PrivateRoute>

<PrivateRoute sellerOnly>     // Only seller can access
  <SellerDashboard />
</PrivateRoute>

<PrivateRoute>                // Any logged-in user
  <UserProfile />
</PrivateRoute>
```

### Route Configuration (`frontend/src/App.jsx`)

#### Admin Routes
```
/admin/dashboard      → Admin dashboard
/admin/users          → Manage users
/admin/sellers        → Manage sellers
/admin/products       → Manage products
/admin/orders         → Manage orders
/admin/categories     → Manage categories
/admin/settings       → System settings
```

#### Seller Routes
```
/seller/dashboard     → Seller dashboard
/seller/products      → My products
/seller/orders        → My orders
/seller/fulfillment   → Order fulfillment
/seller/analytics     → Sales analytics
```

#### User Routes
```
/user/dashboard       → User home
/cart                 → Shopping cart
/checkout             → Checkout
/orders               → My orders
/profile              → User profile
/addresses            → Saved addresses
/wishlist             → Wishlist
```

---

## Workflow Examples

### Example 1: User Becoming a Seller
```
1. User logs in (role: user)
2. Clicks "🏪 Sell" button
3. Fills seller application form
4. Submits POST /api/sellers/register
5. Frontend shows: "Waiting for admin approval"
6. Admin logs in (role: admin)
7. Goes to /admin/sellers (pending list)
8. Approves the seller
9. Seller receives email notification
10. User can now access /seller/dashboard
11. Can create products via POST /api/products
12. Products await admin approval
13. Products visible to customers once approved
```

### Example 2: Admin Managing Products
```
1. Admin logs in (role: admin)
2. Goes to /admin/products
3. Sees all products (seller + admin)
4. Can approve pending products
5. Can reject products with reason
6. Seller is notified
7. Approved products visible to customers
```

### Example 3: Seller Creating Product
```
1. Seller logs in (role: seller, approved: true)
2. Goes to /seller/products
3. Clicks "Add Product"
4. Fills product details
5. Submits POST /api/products (authenticated)
6. Backend: seller ID auto-populated from JWT
7. Backend: Product status = pending
8. Admin approves product
9. Product visible on /products page
10. Customers can purchase
11. Seller can track analytics /seller/analytics
```

---

## Key Features

### ✅ Complete Role Separation
- Users cannot access seller or admin functions
- Sellers cannot access admin functions
- Admins have full system access

### ✅ Automatic Seller ID Association
- All products created by seller auto-linked
- Seller can only edit their own products
- Analytics only show seller's own sales

### ✅ Approval Workflow
- New sellers require admin approval
- New products require admin approval
- Email notifications on approval/rejection

### ✅ Permission Checks
- Database: Both middleware + controller validation
- Frontend: Route guards prevent unauthorized access
- API: JWT token + role verification

### ✅ State Management
- AuthContext stores current user + role
- PrivateRoute checks role before rendering
- Automatic redirect for unauthorized access

---

## Testing the System

### Test as Admin:
```
1. Login with admin credentials
2. Access /admin/dashboard
3. Approve pending sellers
4. Manage all products/orders
5. Create FAQs and configure chatbot
```

### Test as Seller:
```
1. Login as user
2. Go to /seller-center and apply
3. Wait for admin approval
4. Access /seller/dashboard
5. Create products
6. View analytics
```

### Test as User:
```
1. Login as regular user
2. Browse products
3. Add to cart
4. Checkout
5. Track orders
6. View seller profiles
```

---

## Environment Variables Needed

### Backend `.env`
```
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
STRIPE_SECRET_KEY=your-stripe-key
NODE_ENV=production
PORT=10000
```

---

## Summary

Your application is **fully connected** with:
- ✅ Role-based database models
- ✅ Middleware-enforced permissions
- ✅ Frontend route guards
- ✅ Automatic ID associations
- ✅ Approval workflows
- ✅ Email notifications

All users, admins, and sellers are properly connected and can access only their permitted features!
