import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs('report_assets', exist_ok=True)

# Helper function for drawing rounded boxes
def draw_box(ax, x, y, w, h, text, bg_color='#EBF3FA', edge_color='#2B6CB0', text_color='#1A365D', fontsize=9, fontweight='bold', subtitle=None):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.15",
                                fc=bg_color, ec=edge_color, lw=1.5, zorder=2)
    ax.add_patch(box)
    if subtitle:
        ax.text(x + w/2, y + h*0.62, text, ha='center', va='center', color=text_color, fontsize=fontsize, fontweight=fontweight, zorder=3)
        ax.text(x + w/2, y + h*0.28, subtitle, ha='center', va='center', color='#4A5568', fontsize=fontsize-1.5, style='italic', zorder=3)
    else:
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', color=text_color, fontsize=fontsize, fontweight=fontweight, zorder=3)

def draw_arrow(ax, x1, y1, x2, y2, label=None, color='#4A5568', label_pos=0.5, label_offset=(0, 0.15)):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=1.5, shrinkA=3, shrinkB=3), zorder=4)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, ha='center', va='center', fontsize=7.5, color='#2D3748',
                bbox=dict(boxstyle='square,pad=0.15', fc='white', ec='none', alpha=0.85), zorder=5)

# ==========================================
# DIAGRAM 1: FST Website Architecture
# ==========================================
def create_fst_arch():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Title
    ax.text(5, 6.7, 'FinDora Full-Stack Web Application Architecture (FST Track)', ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    # Layer 1: Client Layer
    ax.add_patch(patches.Rectangle((0.3, 4.8), 9.4, 1.5, fc='#F7FAFC', ec='#CBD5E0', lw=1, ls='--', zorder=1))
    ax.text(0.5, 6.05, 'CLIENT TIER (Browser / React 19 UI Components)', fontsize=8.5, fontweight='bold', color='#4A5568')
    draw_box(ax, 0.6, 5.0, 1.9, 0.9, 'Public Pages', subtitle='Home, Browse, Swipe', bg_color='#E6FFFA', edge_color='#319795')
    draw_box(ax, 2.9, 5.0, 1.9, 0.9, 'Auth Portal', subtitle='Login, SAP ID RBAC', bg_color='#FEFCBF', edge_color='#D69E2E')
    draw_box(ax, 5.2, 5.0, 1.9, 0.9, 'Dashboard Pages', subtitle='Post, Profile Workspace', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 7.5, 5.0, 1.9, 0.9, 'Admin Console', subtitle='/admin Moderation', bg_color='#FED7D7', edge_color='#E53E3E')

    # Layer 2: Next.js 16 App Router Tier
    ax.add_patch(patches.Rectangle((0.3, 2.4), 9.4, 2.1, fc='#EDF2F7', ec='#A0AEC0', lw=1, ls='--', zorder=1))
    ax.text(0.5, 4.25, 'APPLICATION TIER (Next.js 16 App Router Server Environment)', fontsize=8.5, fontweight='bold', color='#4A5568')
    
    draw_box(ax, 0.6, 3.2, 2.6, 0.85, 'Edge Proxy Layer (proxy.ts)', subtitle='RBAC Guard & Session Interceptor', bg_color='#FEEBC8', edge_color='#DD6B20')
    draw_box(ax, 3.6, 3.2, 2.8, 0.85, 'Server Actions ("use server")', subtitle='Item Mutations & Claim Handlers', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 6.8, 3.2, 2.6, 0.85, 'REST Route Handlers', subtitle='/api/items, /api/claims, /api/stats', bg_color='#E6FFFA', edge_color='#319795')

    draw_box(ax, 2.0, 2.5, 2.8, 0.6, 'Session & Auth Service', subtitle='JWT & bcrypt Verification', bg_color='#FAF5FF', edge_color='#805AD5', fontsize=8)
    draw_box(ax, 5.3, 2.5, 2.8, 0.6, 'Gemini AI Match Engine', subtitle='/api/ai/match Route', bg_color='#EDFDFD', edge_color='#00B5D8', fontsize=8)

    # Layer 3: Data Tier & External Services
    ax.add_patch(patches.Rectangle((0.3, 0.2), 9.4, 1.9, fc='#F7FAFC', ec='#CBD5E0', lw=1, ls='--', zorder=1))
    ax.text(0.5, 1.85, 'DATA TIER & EXTERNAL INTEGRATIONS', fontsize=8.5, fontweight='bold', color='#4A5568')

    draw_box(ax, 0.6, 0.4, 2.6, 1.2, 'Prisma ORM Client', subtitle='SQLite Relational DB (dev.db)\nUsers, Items, Claims, Chat', bg_color='#EBF3FA', edge_color='#2B6CB0')
    draw_box(ax, 3.7, 0.4, 2.6, 1.2, 'Mongoose Document Store', subtitle='MongoDB Audit Trails\n(Security & Claim Logs)', bg_color='#F0FFF4', edge_color='#38A169')
    draw_box(ax, 6.8, 0.4, 2.6, 1.2, 'Google Gemini Cloud API', subtitle='generativelanguage.googleapis\nGemini 3.5 Flash Model', bg_color='#FAF5FF', edge_color='#805AD5')

    # Connections
    draw_arrow(ax, 1.5, 5.0, 1.5, 4.05, 'HTTP / SSR')
    draw_arrow(ax, 3.8, 5.0, 4.5, 4.05, 'Server Action Invoke')
    draw_arrow(ax, 8.0, 5.0, 8.0, 4.05, 'REST API / JSON')
    
    draw_arrow(ax, 4.8, 3.2, 2.0, 1.6, 'Prisma CRUD')
    draw_arrow(ax, 5.2, 3.2, 5.0, 1.6, 'Audit Logging')
    draw_arrow(ax, 7.5, 2.5, 8.0, 1.6, 'HTTPS API')

    plt.tight_layout()
    plt.savefig('report_assets/fst_arch.png', dpi=300)
    plt.close()

# ==========================================
# DIAGRAM 2: FST Item Reporting & Discovery Flowchart
# ==========================================
def create_fst_report_discovery():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(5, 6.7, 'FinDora Web: Item Reporting and Discovery Lifecycle', ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    draw_box(ax, 0.5, 5.3, 2.0, 0.9, 'Student Submits Form', subtitle='/post (Title, Loc, Photo)', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 3.2, 5.3, 2.0, 0.9, 'Form Validation', subtitle='Email Suffix & Mandatory Fields', bg_color='#FEFCBF', edge_color='#D69E2E')
    draw_box(ax, 5.9, 5.3, 1.8, 0.9, 'Found Item?', subtitle='Type Check', bg_color='#FAF5FF', edge_color='#805AD5')
    draw_box(ax, 8.1, 5.3, 1.5, 0.9, 'Photo Check', subtitle='Mandatory Image', bg_color='#FEEBC8', edge_color='#DD6B20')

    draw_box(ax, 4.0, 3.8, 2.2, 0.9, 'Server Action Dispatch', subtitle='createItemAction()', bg_color='#E6FFFA', edge_color='#319795')
    draw_box(ax, 7.0, 3.8, 2.4, 0.9, 'Prisma DB Write', subtitle='Status: OPEN, dev.db', bg_color='#EBF3FA', edge_color='#2B6CB0')

    draw_box(ax, 0.8, 1.8, 2.2, 1.1, 'Public Browse Catalog', subtitle='/browse Page\nFilters: Type, Cat, Hotspot', bg_color='#F0FFF4', edge_color='#38A169')
    draw_box(ax, 3.8, 1.8, 2.2, 1.1, 'Dynamic Item Detail', subtitle='/items/[id] Page\nProtected View & Claims', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 6.8, 1.8, 2.5, 1.1, 'Gemini Swipe Matcher', subtitle='/swipe Physics Deck\nGesture-based Card Discovery', bg_color='#FAF5FF', edge_color='#805AD5')

    # Flow arrows
    draw_arrow(ax, 2.5, 5.75, 3.2, 5.75)
    draw_arrow(ax, 5.2, 5.75, 5.9, 5.75)
    draw_arrow(ax, 7.7, 5.75, 8.1, 5.75, 'FOUND')
    draw_arrow(ax, 6.8, 5.3, 5.1, 4.7, 'LOST')
    draw_arrow(ax, 8.8, 5.3, 5.5, 4.7, 'Valid Photo')
    draw_arrow(ax, 6.2, 4.25, 7.0, 4.25)
    
    draw_arrow(ax, 7.8, 3.8, 2.0, 2.9, 'revalidatePath("/browse")')
    draw_arrow(ax, 8.2, 3.8, 4.9, 2.9, 'Route Dynamic Load')
    draw_arrow(ax, 8.5, 3.8, 8.0, 2.9, 'Candidate Match Feed')

    plt.tight_layout()
    plt.savefig('report_assets/fst_report_discovery.png', dpi=300)
    plt.close()

# ==========================================
# DIAGRAM 3: FST Ownership Claim Lifecycle
# ==========================================
def create_fst_claim_lifecycle():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(5, 6.7, 'FinDora Web: Ownership Claim Verification Lifecycle', ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    draw_box(ax, 0.5, 5.1, 2.0, 1.0, 'Found Item OPEN', subtitle='Listed on /browse', bg_color='#E6FFFA', edge_color='#319795')
    draw_box(ax, 3.0, 5.1, 2.2, 1.0, 'Student Files Claim', subtitle='ClaimForm.tsx Modal\nRoll No, SAP ID, Proof', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 5.7, 5.1, 2.0, 1.0, 'Validation Engine', subtitle='Regex & Duplicate Check', bg_color='#FEFCBF', edge_color='#D69E2E')
    draw_box(ax, 8.1, 5.1, 1.6, 1.0, 'Claim: PENDING', subtitle='Item Remains OPEN', bg_color='#FEEBC8', edge_color='#DD6B20')

    draw_box(ax, 4.0, 3.2, 2.5, 1.0, 'Admin Review at /admin', subtitle='Inspect Claimant ID & Proof', bg_color='#FED7D7', edge_color='#E53E3E')

    draw_box(ax, 0.8, 1.2, 2.5, 1.1, 'Claim REJECTED', subtitle='Status: REJECTED\nItem remains OPEN for\ncompeting claims', bg_color='#FFF5F5', edge_color='#E53E3E')
    draw_box(ax, 5.0, 1.2, 2.5, 1.1, 'Claim APPROVED', subtitle='Status: APPROVED\nCompeting claims -> REJECTED\nItem Status -> CLAIMED', bg_color='#F0FFF4', edge_color='#38A169')
    draw_box(ax, 8.0, 1.2, 1.6, 1.1, 'Finder Reward', subtitle='+50 Points Awarded\n"Campus Hero" Badge', bg_color='#FEFCBF', edge_color='#D69E2E')

    # Connections
    draw_arrow(ax, 2.5, 5.6, 3.0, 5.6)
    draw_arrow(ax, 5.2, 5.6, 5.7, 5.6)
    draw_arrow(ax, 7.7, 5.6, 8.1, 5.6)
    draw_arrow(ax, 8.9, 5.1, 5.8, 4.2, 'Admin Queue')
    
    draw_arrow(ax, 4.3, 3.2, 2.3, 2.3, 'Reject Claim')
    draw_arrow(ax, 5.5, 3.2, 6.0, 2.3, 'Approve Claim')
    draw_arrow(ax, 7.5, 1.75, 8.0, 1.75, 'Reward Finder')

    plt.tight_layout()
    plt.savefig('report_assets/fst_claim_lifecycle.png', dpi=300)
    plt.close()

# ==========================================
# DIAGRAM 4: FST Administrator Handover Workflow
# ==========================================
def create_fst_handover_workflow():
    fig, ax = plt.subplots(figsize=(10, 5.8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis('off')

    ax.text(5, 6.2, 'FinDora Web: Administrator Physical Handover & Resolution Workflow', ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    draw_box(ax, 0.6, 4.5, 2.5, 1.0, 'Item Status: CLAIMED', subtitle='Approved claim logged\nHandover Queue active', bg_color='#FEFCBF', edge_color='#D69E2E')
    draw_box(ax, 3.8, 4.5, 2.6, 1.0, 'Campus Desk Meeting', subtitle='Ground Floor Security Desk\nGate 2 Handover Protocol', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 7.0, 4.5, 2.4, 1.0, 'Physical Verification', subtitle='Student ID Card & SAP ID\nCross-verified by Admin', bg_color='#FAF5FF', edge_color='#805AD5')

    draw_box(ax, 2.0, 2.2, 2.8, 1.1, 'Admin Console Action', subtitle='Click "Complete Handover"\nServer Action: resolveClaimAction()', bg_color='#FED7D7', edge_color='#E53E3E')
    draw_box(ax, 5.8, 2.2, 2.8, 1.1, 'Item Status: RESOLVED', subtitle='Reunited with verified owner\nRemoved from active queues', bg_color='#F0FFF4', edge_color='#38A169')

    draw_box(ax, 3.6, 0.4, 3.2, 1.0, 'Mongoose Audit Trail Logged', subtitle='ITEM_HANDOVER_RESOLVED\nImmutable Record in MongoDB', bg_color='#EDF2F7', edge_color='#4A5568')

    # Connections
    draw_arrow(ax, 3.1, 5.0, 3.8, 5.0)
    draw_arrow(ax, 6.4, 5.0, 7.0, 5.0)
    draw_arrow(ax, 8.2, 4.5, 4.3, 3.3, 'ID Matches')
    draw_arrow(ax, 4.8, 2.75, 5.8, 2.75)
    draw_arrow(ax, 7.2, 2.2, 5.8, 1.4, 'Write Log')

    plt.tight_layout()
    plt.savefig('report_assets/fst_handover_workflow.png', dpi=300)
    plt.close()

# ==========================================
# DIAGRAM 5: ADF Mobile Application Architecture
# ==========================================
def create_adf_arch():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(5, 6.7, 'FinDora Cross-Platform Mobile Application Architecture (ADF Track)', ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    # Layer 1: Presentation Layer
    ax.add_patch(patches.Rectangle((0.3, 4.8), 9.4, 1.5, fc='#F7FAFC', ec='#CBD5E0', lw=1, ls='--', zorder=1))
    ax.text(0.5, 6.05, 'PRESENTATION LAYER (Material 3 UI Widgets & Screens)', fontsize=8.5, fontweight='bold', color='#4A5568')
    draw_box(ax, 0.5, 5.0, 1.6, 0.9, 'HomeScreen', subtitle='Stats & Recents', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 2.3, 5.0, 1.6, 0.9, 'BrowseScreen', subtitle='Search & Filters', bg_color='#E6FFFA', edge_color='#319795')
    draw_box(ax, 4.1, 5.0, 1.7, 0.9, 'GeminiMatcher', subtitle='AI Semantic Match', bg_color='#FAF5FF', edge_color='#805AD5')
    draw_box(ax, 6.0, 5.0, 1.6, 0.9, 'PostItemScreen', subtitle='Form & Auto-Detect', bg_color='#FEFCBF', edge_color='#D69E2E')
    draw_box(ax, 7.8, 5.0, 1.8, 0.9, 'ProfileScreen', subtitle='ID & My Claims', bg_color='#FED7D7', edge_color='#E53E3E')

    # Layer 2: State & Service Layer
    ax.add_patch(patches.Rectangle((0.3, 2.5), 9.4, 2.0, fc='#EDF2F7', ec='#A0AEC0', lw=1, ls='--', zorder=1))
    ax.text(0.5, 4.25, 'SERVICE & LOGIC LAYER (Dart Asynchronous Services)', fontsize=8.5, fontweight='bold', color='#4A5568')

    draw_box(ax, 0.6, 3.2, 2.6, 0.9, 'ThemeService', subtitle='ChangeNotifier\nDark/Light Mode Sync', bg_color='#FEEBC8', edge_color='#DD6B20')
    draw_box(ax, 3.7, 3.2, 2.6, 0.9, 'ApiService (http)', subtitle='JSON REST Client\nFallback to SeedData', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 6.8, 3.2, 2.6, 0.9, 'GeminiService', subtitle='Category Detection &\nCampus Advisories', bg_color='#FAF5FF', edge_color='#805AD5')

    # Layer 3: Data Layer & Shared Backend
    ax.add_patch(patches.Rectangle((0.3, 0.3), 9.4, 1.9, fc='#F7FAFC', ec='#CBD5E0', lw=1, ls='--', zorder=1))
    ax.text(0.5, 1.95, 'DATA MODELS & SHARED BACKEND INTEGRATION', fontsize=8.5, fontweight='bold', color='#4A5568')

    draw_box(ax, 0.8, 0.6, 3.8, 1.1, 'Type-Safe Dart Data Models', subtitle='Item.dart (fromJson / toJson)\nOffline SeedData Catalog', bg_color='#E6FFFA', edge_color='#319795')
    draw_box(ax, 5.4, 0.6, 3.8, 1.1, 'Shared Next.js REST API Backend', subtitle='http://localhost:3000/api/\n/items, /claims, /ai/match', bg_color='#EBF3FA', edge_color='#2B6CB0')

    # Connections
    draw_arrow(ax, 1.3, 5.0, 1.9, 4.1)
    draw_arrow(ax, 3.1, 5.0, 4.5, 4.1)
    draw_arrow(ax, 5.0, 5.0, 7.8, 4.1)
    draw_arrow(ax, 6.8, 5.0, 5.5, 4.1)
    
    draw_arrow(ax, 4.5, 3.2, 3.2, 1.7, 'Deserialize')
    draw_arrow(ax, 5.5, 3.2, 6.8, 1.7, 'HTTP GET/POST')

    plt.tight_layout()
    plt.savefig('report_assets/adf_arch.png', dpi=300)
    plt.close()

# ==========================================
# DIAGRAM 6: ADF Screen Navigation Hierarchy
# ==========================================
def create_adf_nav_hierarchy():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(5, 6.7, 'FinDora Mobile: Screen Navigation & Module Structure', ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    draw_box(ax, 3.5, 5.4, 3.0, 0.9, 'MaterialApp Entrypoint', subtitle='main.dart (ThemeNotifier Root)', bg_color='#EBF3FA', edge_color='#2B6CB0')
    draw_box(ax, 3.2, 4.0, 3.6, 0.8, 'Main Navigation Shell (Scaffold)', subtitle='IndexedStack & BottomNavigationBar (5 Tabs)', bg_color='#FAF5FF', edge_color='#805AD5')

    draw_box(ax, 0.4, 2.5, 1.6, 0.9, 'Tab 0: Home', subtitle='Metrics & Recents', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 2.2, 2.5, 1.6, 0.9, 'Tab 1: Browse', subtitle='Search & Filters', bg_color='#E6FFFA', edge_color='#319795')
    draw_box(ax, 4.1, 2.5, 1.8, 0.9, 'Tab 2: AI Match', subtitle='Gemini Matcher', bg_color='#FEFCBF', edge_color='#D69E2E')
    draw_box(ax, 6.1, 2.5, 1.6, 0.9, 'Tab 3: Report', subtitle='Post Item Form', bg_color='#FEEBC8', edge_color='#DD6B20')
    draw_box(ax, 7.9, 2.5, 1.7, 0.9, 'Tab 4: Profile', subtitle='ID Card & Claims', bg_color='#FED7D7', edge_color='#E53E3E')

    # Sub-screens
    draw_box(ax, 1.2, 0.6, 2.3, 1.1, 'ItemDetailScreen', subtitle='Modal View & Claims Form\nLive Pending Claim Banner', bg_color='#EDFDFD', edge_color='#00B5D8')
    draw_box(ax, 3.9, 0.6, 2.3, 1.1, 'ChatScreen', subtitle='In-App Peer Chat\nPredefined Safety Prompts', bg_color='#FAF5FF', edge_color='#805AD5')
    draw_box(ax, 6.6, 0.6, 2.4, 1.1, 'AdminSecurityScreen', subtitle='Moderation Queue\n(Faculty Role Exclusive)', bg_color='#FFF5F5', edge_color='#E53E3E')

    # Arrows
    draw_arrow(ax, 5.0, 5.4, 5.0, 4.8)
    draw_arrow(ax, 3.8, 4.0, 1.2, 3.4)
    draw_arrow(ax, 4.4, 4.0, 3.0, 3.4)
    draw_arrow(ax, 5.0, 4.0, 5.0, 3.4)
    draw_arrow(ax, 5.6, 4.0, 6.9, 3.4)
    draw_arrow(ax, 6.2, 4.0, 8.7, 3.4)

    draw_arrow(ax, 3.0, 2.5, 2.3, 1.7, 'Select Item')
    draw_arrow(ax, 2.3, 0.6, 3.9, 0.8, 'Chat Handshake')
    draw_arrow(ax, 8.7, 2.5, 7.8, 1.7, 'Admin Role Switch')

    plt.tight_layout()
    plt.savefig('report_assets/adf_nav_hierarchy.png', dpi=300)
    plt.close()

# ==========================================
# DIAGRAM 7: ADF Mobile Item-Reporting Workflow
# ==========================================
def create_adf_report_workflow():
    fig, ax = plt.subplots(figsize=(10, 5.8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis('off')

    ax.text(5, 6.2, 'FinDora Mobile: Item Reporting Workflow with Gemini Auto-Detect', ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    draw_box(ax, 0.5, 4.5, 2.2, 1.1, 'Open PostItemScreen', subtitle='User types item title\nand description', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 3.3, 4.5, 2.4, 1.1, 'Gemini Category Auto-Detect', subtitle='GeminiService.suggestCategory()\nKeyword classification', bg_color='#FAF5FF', edge_color='#805AD5')
    draw_box(ax, 6.3, 4.5, 1.6, 1.1, 'Item Type Check', subtitle='LOST vs FOUND', bg_color='#FEFCBF', edge_color='#D69E2E')
    draw_box(ax, 8.3, 4.5, 1.4, 1.1, 'Image Rule', subtitle='Mandatory for FOUND', bg_color='#FEEBC8', edge_color='#DD6B20')

    draw_box(ax, 1.5, 2.2, 3.0, 1.1, 'Form Field Validation', subtitle='GlobalKey<FormState>\nSVKM Email (@svkmmumbai...)', bg_color='#EBF3FA', edge_color='#2B6CB0')
    draw_box(ax, 5.5, 2.2, 3.0, 1.1, 'Asynchronous HTTP Dispatch', subtitle='ApiService.postItem()\nPOST /api/items over HTTP', bg_color='#E6FFFA', edge_color='#319795')

    draw_box(ax, 3.5, 0.4, 3.2, 1.0, 'Backend Response & Navigation', subtitle='SnackBar Success / Error Feedback\nAutomatic Pop back to Browse', bg_color='#F0FFF4', edge_color='#38A169')

    # Connections
    draw_arrow(ax, 2.7, 5.05, 3.3, 5.05)
    draw_arrow(ax, 5.7, 5.05, 6.3, 5.05)
    draw_arrow(ax, 7.9, 5.05, 8.3, 5.05, 'FOUND')
    draw_arrow(ax, 7.1, 4.5, 3.8, 3.3, 'LOST')
    draw_arrow(ax, 9.0, 4.5, 4.2, 3.3, 'Photo Attached')
    draw_arrow(ax, 4.5, 2.75, 5.5, 2.75, 'Form Valid')
    draw_arrow(ax, 7.0, 2.2, 5.5, 1.4, 'HTTP 201 Created')

    plt.tight_layout()
    plt.savefig('report_assets/adf_report_workflow.png', dpi=300)
    plt.close()

# ==========================================
# DIAGRAM 8: ADF Mobile Claim Submission Workflow
# ==========================================
def create_adf_claim_workflow():
    fig, ax = plt.subplots(figsize=(10, 5.8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis('off')

    ax.text(5, 6.2, 'FinDora Mobile: Claim Submission and Status Tracking Lifecycle', ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    draw_box(ax, 0.5, 4.5, 2.2, 1.1, 'View FOUND Item', subtitle='ItemDetailScreen\nTap "Claim This Item"', bg_color='#E6FFFA', edge_color='#319795')
    draw_box(ax, 3.2, 4.5, 2.4, 1.1, 'Claim Submission Modal', subtitle='Input Roll No, SAP ID,\nDept, and Proof Details', bg_color='#EBF8FF', edge_color='#3182CE')
    draw_box(ax, 6.1, 4.5, 2.2, 1.1, 'Regex Input Validation', subtitle='Roll: ^[A-Za-z][0-9]{3}$\nSAP: ^6[0-9]{10,11}$', bg_color='#FEFCBF', edge_color='#D69E2E')
    draw_box(ax, 8.6, 4.5, 1.1, 1.1, 'Proof?', subtitle='Min 5 chars', bg_color='#FEEBC8', edge_color='#DD6B20')

    draw_box(ax, 1.5, 2.2, 3.2, 1.1, 'HTTP POST to Backend', subtitle='ApiService.submitClaim()\nPOST /api/claims (JSON payload)', bg_color='#FAF5FF', edge_color='#805AD5')
    draw_box(ax, 5.5, 2.2, 3.2, 1.1, 'Live Claim Status Banner', subtitle='_existingClaim container\nDisplays stated proof & status', bg_color='#EDFDFD', edge_color='#00B5D8')

    draw_box(ax, 3.5, 0.4, 3.2, 1.0, 'Campus Gate 2 Protocol Display', subtitle='Physical verification instructions\nfor Ground Floor Security Desk', bg_color='#F0FFF4', edge_color='#38A169')

    # Connections
    draw_arrow(ax, 2.7, 5.05, 3.2, 5.05)
    draw_arrow(ax, 5.6, 5.05, 6.1, 5.05)
    draw_arrow(ax, 8.3, 5.05, 8.6, 5.05)
    draw_arrow(ax, 9.1, 4.5, 4.0, 3.3, 'Substantive Proof')
    draw_arrow(ax, 4.7, 2.75, 5.5, 2.75, 'Claim: PENDING')
    draw_arrow(ax, 7.1, 2.2, 5.5, 1.4, 'Display Protocol')

    plt.tight_layout()
    plt.savefig('report_assets/adf_claim_workflow.png', dpi=300)
    plt.close()

if __name__ == '__main__':
    create_fst_arch()
    create_fst_report_discovery()
    create_fst_claim_lifecycle()
    create_fst_handover_workflow()
    create_adf_arch()
    create_adf_nav_hierarchy()
    create_adf_report_workflow()
    create_adf_claim_workflow()
    print("All 8 diagrams generated successfully in report_assets/!")
