ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_key text;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS image_key text;
ALTER TABLE public.laser_project_images ADD COLUMN IF NOT EXISTS image_key text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS image_key text;
