import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from marketplace.models import Product

User = get_user_model()

# Ensure an artisan user exists
artisan_user, _ = User.objects.get_or_create(
    username="master_artisan",
    defaults={
        "email": "artisan@kaarigar.com",
        "role": "artisan",
        "phone": "+919876543210",
        "is_verified": True
    }
)
artisan_user.set_password("Password123!")
artisan_user.role = "artisan"
artisan_user.save()

# Ensure a buyer user exists
buyer_user, _ = User.objects.get_or_create(
    username="testbuyer",
    defaults={
        "email": "buyer@kaarigar.com",
        "role": "buyer",
        "phone": "+919876543211",
        "is_verified": True
    }
)
buyer_user.set_password("Password123!")
buyer_user.role = "buyer"
buyer_user.save()

ART_ITEMS = [
    {
        "title": "Royal Heritage Canvas Oil Portrait",
        "category": "Oil painting",
        "craft_technique": "Layered Oil Glazing",
        "description": "Exquisite hand-painted oil portrait crafted using classic glazing techniques on premium stretched linen canvas.",
        "price_min": 2500,
        "price_max": 5000,
        "image": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
        "tags": ["Oil Painting", "Fine Art", "Portrait", "Canvas"]
    },
    {
        "title": "Abstract Vibrant Acrylic Expression",
        "category": "Acrylic painting",
        "craft_technique": "Impasto Acrylic Palette Knife",
        "description": "Modern abstract expressionism in high-pigment acrylics with rich texture and vibrant color transitions.",
        "price_min": 1800,
        "price_max": 3500,
        "image": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
        "tags": ["Acrylic", "Abstract", "Modern Art", "Canvas"]
    },
    {
        "title": "Botanical Flora Watercolor Artwork",
        "category": "Watercolor painting",
        "craft_technique": "Wet-on-Wet Watercolor",
        "description": "Delicate hand-painted botanical study on 300gsm cold-press handmade cotton rag paper.",
        "price_min": 1200,
        "price_max": 2800,
        "image": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
        "tags": ["Watercolor", "Botanical", "Paper Art", "Flora"]
    },
    {
        "title": "Soft Pastel Sunset Valley Landscape",
        "category": "Pastel art",
        "craft_technique": "Soft Pastel Blending",
        "description": "Atmospheric mountain sunset scene blended using professional chalk pastels on textured pastel paper.",
        "price_min": 1500,
        "price_max": 3000,
        "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
        "tags": ["Pastel", "Landscape", "Sunset", "Soft Chalk"]
    },
    {
        "title": "Tactile Expressionist Finger Painting",
        "category": "Finger painting",
        "craft_technique": "Direct Pigment Fingerwork",
        "description": "Raw, energetic abstract artwork created directly with fingers using non-toxic natural earth pigments.",
        "price_min": 1000,
        "price_max": 2200,
        "image": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop",
        "tags": ["Finger Painting", "Abstract", "Natural Pigment"]
    },
    {
        "title": "Fine Detail Graphite Portrait Sketch",
        "category": "Graphite sketching",
        "craft_technique": "Multi-Grade Pencil Shading",
        "description": "Hyper-realistic monochrome portrait sketch drawn using 2B to 8B graphite pencils on heavy cartridge paper.",
        "price_min": 800,
        "price_max": 1800,
        "image": "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?q=80&w=800&auto=format&fit=crop",
        "tags": ["Graphite", "Sketching", "Portrait", "Monochrome"]
    },
    {
        "title": "Charcoal Heritage Tribal Portrait Drawing",
        "category": "Charcoal drawing",
        "craft_technique": "Smudge & Vine Charcoal",
        "description": "Dramatic high-contrast charcoal drawing showcasing depth, shadow play, and expressive emotion.",
        "price_min": 1100,
        "price_max": 2400,
        "image": "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?q=80&w=800&auto=format&fit=crop",
        "tags": ["Charcoal", "Drawing", "Tribal", "Monochrome"]
    },
    {
        "title": "Intricate Geometric Zentangle Illustration",
        "category": "Zentangle art",
        "craft_technique": "Fine Nib Ink Linework",
        "description": "Mindful geometric pattern drawing created using waterproof archival ink pens on heavy bristol board.",
        "price_min": 950,
        "price_max": 2000,
        "image": "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
        "tags": ["Zentangle", "Ink Art", "Mandala", "Geometry"]
    },
    {
        "title": "Handcarved Teakwood Artisan Statue",
        "category": "Hand-carved sculpture",
        "craft_technique": "Traditional Chisel & Polish",
        "description": "Single-block seasoned teakwood sculpture carved by master craftsmen with natural beeswax finish.",
        "price_min": 3500,
        "price_max": 8000,
        "image": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
        "tags": ["Woodcarving", "Sculpture", "Teakwood", "Handcrafted"]
    },
    {
        "title": "Terracotta Handcrafted Clay Ritual Pottery",
        "category": "Clay pottery",
        "craft_technique": "Wheel Thrown Clay & Etching",
        "description": "Eco-friendly clay pot handcrafted on traditional pottery wheel and sun-baked with tribal motifs.",
        "price_min": 750,
        "price_max": 1600,
        "image": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800&auto=format&fit=crop",
        "tags": ["Clay Pottery", "Terracotta", "Handmade", "Eco-Friendly"]
    },
    {
        "title": "Zardosi Silk Hand Embroidery Wall Panel",
        "category": "Hand embroidery",
        "craft_technique": "Needlework & Zari Threading",
        "description": "Intricate hand needlework featuring gold metallic thread, beads, and silk embroidery on raw silk fabric.",
        "price_min": 2200,
        "price_max": 4800,
        "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
        "tags": ["Embroidery", "Needlework", "Zardosi", "Silk"]
    },
    {
        "title": "Traditional Handloom Silk Tapestry",
        "category": "Handloom weaving",
        "craft_technique": "Shuttle Handloom Weaving",
        "description": "Hand-woven heritage textile crafted on wooden pit-looms using natural dyed silk strands.",
        "price_min": 3000,
        "price_max": 7500,
        "image": "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?q=80&w=800&auto=format&fit=crop",
        "tags": ["Handloom", "Weaving", "Textile", "Silk"]
    },
    {
        "title": "Traditional Mithila Folk Madhubani Painting",
        "category": "Madhubani painting",
        "craft_technique": "Bamboo Nib & Natural Dyes",
        "description": "Authentic Mithila folk painting depicting nature and mythology painted using natural plant dyes.",
        "price_min": 2000,
        "price_max": 4500,
        "image": "https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=800&auto=format&fit=crop",
        "tags": ["Madhubani", "Folk Art", "Mithila", "Traditional"]
    },
    {
        "title": "Tribal Harvest Celebration Warli Art",
        "category": "Warli art",
        "craft_technique": "Rice Paste & Mud Background",
        "description": "Classic Maharashtrian Warli tribal art drawn with white rice paste on dark terracotta mud background.",
        "price_min": 1400,
        "price_max": 3200,
        "image": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
        "tags": ["Warli", "Tribal Art", "Folk", "Terracotta"]
    },
    {
        "title": "Vibrant Tree of Life Gond Folk Painting",
        "category": "Gond art",
        "craft_technique": "Fine Dot & Pattern Work",
        "description": "Mesmerizing Gond tribal folk painting with signature dot and line textures celebrating sacred forest flora and fauna.",
        "price_min": 2400,
        "price_max": 5200,
        "image": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
        "tags": ["Gond Art", "Tribal Folk", "Pattern", "Vibrant"]
    }
]

print("Seeding 15 Hand Art Products...")
for item in ART_ITEMS:
    prod, created = Product.objects.update_or_create(
        title=item["title"],
        defaults={
            "artisan": artisan_user,
            "category": item["category"],
            "craft_technique": item["craft_technique"],
            "description": item["description"],
            "price_min_inr": item["price_min"],
            "price_max_inr": item["price_max"],
            "image_data_url": item["image"],
            "tags": item["tags"],
            "status": "published",
            "source": "manual"
        }
    )
    status_str = "Created" if created else "Updated"
    print(f"  [OK] [{status_str}] {item['category']}")

print("Seeding completed successfully! Total products:", Product.objects.count())
