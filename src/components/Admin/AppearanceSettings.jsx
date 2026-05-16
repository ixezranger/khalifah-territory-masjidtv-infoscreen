import GlassCard from '../shared/GlassCard';
import MediaUploader from '../shared/MediaUploader';
import useStore from '../../store/useStore';
import { updateProfile } from '../../lib/supabase';

const btnSecondary = {
  background: 'transparent',
  color: '#ef4444',
  border: '1px solid rgba(239,68,68,0.4)',
  borderRadius: '8px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '13px',
  marginTop: '10px',
};

export default function AppearanceSettings() {
  const { user, profile, setProfile } = useStore();

  const handleBgUpload = async ({ url }) => {
    if (!user?.id) return;
    const { data } = await updateProfile(user.id, { background_image_url: url });
    if (data) setProfile(data);
  };

  const handleRemoveBg = async () => {
    if (!user?.id) return;
    const { data } = await updateProfile(user.id, { background_image_url: null });
    if (data) setProfile(data);
  };

  return (
    <div>
      {/* Background Image */}
      <GlassCard>
        <h3 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#C9A84C',
          fontSize: '1rem',
          margin: '0 0 16px 0',
        }}>
          Imej Latar Belakang
        </h3>

        <div style={{ marginBottom: '16px' }}>
          {profile?.background_image_url ? (
            <div>
              <img
                src={profile.background_image_url}
                alt="Background preview"
                style={{
                  width: '100%',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid rgba(201,168,76,0.3)',
                }}
              />
              <button onClick={handleRemoveBg} style={btnSecondary}>
                Buang Imej Latar
              </button>
            </div>
          ) : (
            <p style={{
              color: '#F5EDD6',
              fontStyle: 'italic',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              opacity: 0.6,
            }}>
              Tiada imej latar
            </p>
          )}
        </div>

        <MediaUploader
          accept="image"
          userId={user?.id}
          uploadPath="backgrounds"
          onUploadComplete={handleBgUpload}
        />
      </GlassCard>

      {/* Colour Theme */}
      <GlassCard style={{ marginTop: '16px' }}>
        <h3 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#C9A84C',
          fontSize: '1rem',
          margin: '0 0 12px 0',
        }}>
          Tema Warna
        </h3>
        <p style={{
          color: '#F5EDD6',
          fontStyle: 'italic',
          opacity: 0.6,
          fontSize: '0.9rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          margin: 0,
        }}>
          Pilihan tema tambahan akan datang
        </p>
      </GlassCard>
    </div>
  );
}
