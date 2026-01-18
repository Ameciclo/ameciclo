interface MemberCardProps {
  member: {
    id: string;
    name: string;
    bio?: string;
    media?: { url: string };
  };
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  showBio?: boolean;
}

export function MemberCard({ member, onClick, showBio = false }: MemberCardProps) {
  return (
    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
      <button
        className="w-full text-left bg-white rounded-lg shadow-lg flex flex-col overflow-hidden cursor-pointer focus:ring-2 focus:ring-ameciclo focus:ring-offset-2"
        onClick={onClick}
      >
        <div className="relative w-full h-64 overflow-hidden">
          {member.media ? (
            <img src={member.media.url} alt={member.name} className="absolute w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        <div className="p-6 flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{member.name}</h2>
          {showBio && member.bio && (
            <>
              <p className="text-sm text-gray-600 mt-2 line-clamp-4">{member.bio}</p>
              {member.bio.length > 150 && (
                <span className="text-xs text-gray-500 mt-1 block">... ver mais</span>
              )}
            </>
          )}
        </div>
      </button>
    </div>
  );
}
