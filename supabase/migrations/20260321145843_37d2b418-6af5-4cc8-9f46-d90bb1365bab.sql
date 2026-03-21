CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
  acct_type TEXT;
BEGIN
  base_username := LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), ' ', '-'));
  final_username := base_username;
  
  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username);
    counter := counter + 1;
    final_username := base_username || '-' || counter;
  END LOOP;

  acct_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'user');

  INSERT INTO public.profiles (id, username, display_name, account_type)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    acct_type
  );
  RETURN NEW;
END;
$function$