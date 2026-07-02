
-- =========== ENUMS ===========
CREATE TYPE public.deal_stage AS ENUM ('qualified','contact_made','demo_scheduled','proposal_made','negotiations_started');
CREATE TYPE public.deal_status AS ENUM ('open','won','lost');
CREATE TYPE public.task_priority AS ENUM ('low','medium','high');
CREATE TYPE public.task_status AS ENUM ('pending','working','waiting','approved','done');
CREATE TYPE public.activity_type AS ENUM ('lifecycle','email','call','note','meeting','task','form','video','sms');
CREATE TYPE public.call_disposition AS ENUM ('no_answer','voicemail','contact_not_in','left_message','call_back_later','busy','not_interested','connected','meeting_set');
CREATE TYPE public.lead_status AS ENUM ('cold','warm','hot','open','closed');

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  title TEXT DEFAULT 'Sales Rep',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles read all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles upsert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== COMPANIES ===========
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  employees INT,
  annual_revenue BIGINT,
  logo_url TEXT,
  location TEXT,
  description TEXT,
  tech_stack TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies all auth" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== CONTACTS ===========
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  lead_source TEXT,
  lead_status public.lead_status DEFAULT 'open',
  lifecycle_stage TEXT DEFAULT 'lead',
  score INT DEFAULT 0,
  annual_revenue BIGINT,
  owner_name TEXT,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts all auth" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== DEALS ===========
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  stage public.deal_stage NOT NULL DEFAULT 'qualified',
  status public.deal_status NOT NULL DEFAULT 'open',
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  owner_name TEXT,
  expected_close_date DATE,
  color_top TEXT DEFAULT 'violet',
  color_bottom TEXT DEFAULT 'amber',
  rotting BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals all auth" ON public.deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== TASKS ===========
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority public.task_priority DEFAULT 'medium',
  status public.task_status DEFAULT 'pending',
  due_date DATE,
  group_label TEXT DEFAULT 'This Week',
  group_color TEXT DEFAULT 'violet',
  owner_name TEXT,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks all auth" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== ACTIVITIES ===========
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.activity_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  actor_name TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities all auth" ON public.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== CALLS ===========
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  direction TEXT DEFAULT 'outbound',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_sec INT DEFAULT 0,
  disposition public.call_disposition,
  notes TEXT,
  recording_url TEXT,
  agent_name TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calls TO authenticated;
GRANT ALL ON public.calls TO service_role;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calls all auth" ON public.calls FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== DOCUMENTS ===========
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_type TEXT,
  size_bytes BIGINT,
  source TEXT DEFAULT 'Owned by Me',
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents all auth" ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
