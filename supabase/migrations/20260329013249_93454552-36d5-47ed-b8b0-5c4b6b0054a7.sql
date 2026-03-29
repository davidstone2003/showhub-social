-- Allow post owners to update their own winners
CREATE POLICY "Users can update own winners"
ON public.winners
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow post owners to delete their own winners
CREATE POLICY "Users can delete own winners"
ON public.winners
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);