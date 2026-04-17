# Forsaken: Ireland Urbex Map - Deployment Guide

## Project Completion Status

All 9 phases are complete:
- ✅ Phase 1: Project scaffolding with Vite and dependencies
- ✅ Phase 2: Extract components from monolith
- ✅ Phase 3: Set up Supabase and migrate to real database
- ✅ Phase 4: Implement user authentication (email/password)
- ✅ Phase 5: Photo upload and display system
- ✅ Phase 6: Content moderation with OpenAI API
- ✅ Phase 7: Comment threads with real-time updates
- ✅ Phase 8: Satellite map style toggle
- ✅ Phase 9: Polish and deployment

## Pre-Deployment Checklist

### Supabase Configuration
- [ ] Create `locations` table (Phase 3 migration)
- [ ] Create `comments` table (Phase 7 migration)
- [ ] Enable Realtime for `comments` table
- [ ] Create `location-photos` storage bucket
- [ ] Set storage policies for public read, authenticated upload
- [ ] Configure RLS policies on both tables
- [ ] Test database connections locally

### Environment Variables
Ensure `.env.local` has all required keys:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_OPENAI_API_KEY=...
VITE_MAPBOX_TOKEN=...
```

**IMPORTANT:** Never commit `.env.local` to version control!

### Build & Test
```bash
npm run build           # Verify production build
npm run preview         # Test production build locally
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy!

### Option 2: Netlify
1. Push code to GitHub
2. Connect GitHub repo to Netlify
3. Add environment variables in Site Settings
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy!

### Option 3: Self-Hosted
```bash
npm run build
# Upload `dist` folder to your web server
```

## Post-Deployment

### Test Features
- [ ] Map loads with satellite style
- [ ] Can toggle to street map
- [ ] Can see locations from database
- [ ] Can sign up / sign in
- [ ] Can submit new location with photo
- [ ] Can upload photo to storage
- [ ] Can add comments
- [ ] Comments appear in real-time
- [ ] Content moderation works
- [ ] Can like locations
- [ ] Can search and filter

### Monitor Performance
- Check Mapbox quota usage
- Monitor Supabase bandwidth
- Track OpenAI API costs
- Review storage usage

## Production Optimization

### Bundle Size
Current: ~2.1MB (uncompressed), ~595KB (gzipped)

To reduce:
1. Dynamic import Mapbox GL (lazy load)
2. Tree-shake unused code
3. Consider splitting vendor chunks

### Caching
- Set long TTL on dist assets
- Use SWCache for offline support
- Cache location photos in CDN

### Database
- Add indexes for common queries
- Set up connection pooling for Supabase
- Archive old comments periodically

## Security Considerations

### API Keys
- Mapbox token: public key (safe)
- OpenAI key: should be backend only (move to Edge Functions for production)
- Supabase anon key: only allows RLS-defined access

### Storage
- Photo bucket: public read (intentional)
- Verify file size limits before upload
- Implement virus scanning for photos

### Content
- Moderation prevents harmful submissions
- RLS prevents unauthorized updates
- Email verification recommended for production

## Maintenance

### Regular Tasks
1. Monitor cost trends
2. Review error logs
3. Update dependencies monthly
4. Rotate API keys periodically
5. Archive comments older than 6 months

### Feature Monitoring
- Comment growth
- Photo upload volume
- Moderation flag rates
- User authentication issues

## Rollback Plan
1. Keep previous Vercel deployment
2. Tag releases in git
3. Store deployment config as code
4. Document breaking changes

## Support & Updates
- GitHub issues for bugs
- Feature requests tracked in Linear (if using)
- Security updates: apply immediately
- Breaking changes: version in CLAUDE.md

## Useful Commands
```bash
npm run dev              # Local dev
npm run build            # Production build
npm run preview          # Test prod build
npm run lint             # Code quality
npm run format           # Code formatting
```

## Final Notes
- Backup Supabase daily
- Monitor costs weekly
- Document any customizations
- Keep team updated on production changes

## Contact & Attribution
Built with:
- React 18 + Vite
- Mapbox GL JS
- Supabase (Backend)
- OpenAI (Moderation)

Username: dripsupply27
