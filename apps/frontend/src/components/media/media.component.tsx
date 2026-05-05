'use client';

import React, {
  ChangeEvent,
  ClipboardEvent,
  FC,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@gitroom/react/form/button';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Media } from '@prisma/client';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import EventEmitter from 'events';
import { useToaster } from '@gitroom/react/toaster/toaster';
import clsx from 'clsx';
import { VideoFrame } from '@gitroom/react/helpers/video.frame';
import { useUppyUploader } from '@gitroom/frontend/components/media/new.uploader';
import dynamic from 'next/dynamic';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { AiImage } from '@gitroom/frontend/components/launches/ai.image';
import { DropFiles } from '@gitroom/frontend/components/layout/drop.files';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { ThirdPartyMedia } from '@gitroom/frontend/components/third-parties/third-party.media';
import { ReactSortable } from 'react-sortablejs';
import { MediaComponentInner } from '@gitroom/frontend/components/launches/helpers/media.settings.component';
import { AiVideo } from '@gitroom/frontend/components/launches/ai.video';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { ThirdPartyMediaLibrary } from '@gitroom/frontend/components/third-parties/third-party.media-library';
import { Dashboard } from '@uppy/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  DeleteCircleIcon,
  CloseCircleIcon,
  DragHandleIcon,
  MediaSettingsIcon,
  InsertMediaIcon,
  DesignMediaIcon,
  VerticalDividerIcon,
  NoMediaIcon,
  FolderClosedIcon,
  FolderOpenIcon,
  TrashIcon,
} from '@gitroom/frontend/components/ui/icons';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useShallow } from 'zustand/react/shallow';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useDebounce } from 'use-debounce';
const Polonto = dynamic(
  () => import('@gitroom/frontend/components/launches/polonto')
);
const showModalEmitter = new EventEmitter();

type TypeFilter = 'all' | 'image' | 'video';

const useMediaFolders = () => {
  const fetch = useFetch();
  return useSWR('media-folders', async () =>
    (await fetch('/media/folders')).json()
  );
};

const useMediaList = (
  page: number,
  search: string,
  folderId: string | null,
  typeFilter: TypeFilter
) => {
  const fetch = useFetch();
  return useSWR(
    `get-media-${page}-${search}-${folderId}-${typeFilter}`,
    async () => {
      const params = new URLSearchParams({ page: String(page + 1) });
      if (search.trim()) params.set('search', search.trim());
      if (folderId) params.set('folderId', folderId);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      return (await fetch(`/media?${params.toString()}`)).json();
    }
  );
};
export const Pagination: FC<{
  current: number;
  totalPages: number;
  setPage: (num: number) => void;
}> = (props) => {
  const t = useT();

  const { current, totalPages, setPage } = props;

  const paginationItems = useMemo(() => {
    // Convert to 1-based for algorithm (current is 0-based)
    const c = current + 1;
    const m = totalPages;

    // If total pages <= 10, show all pages
    if (m <= 10) {
      return Array.from({ length: m }, (_, i) => i + 1);
    }

    const delta = 3;
    const left = c - delta;
    const right = c + delta + 1;
    const range: number[] = [];
    const rangeWithDots: (number | '...')[] = [];
    let l: number | undefined;

    // Build the range of pages to show
    for (let i = 1; i <= m; i++) {
      if (i === 1 || i === m || (i >= left && i < right)) {
        range.push(i);
      }
    }

    // Add dots where there are gaps
    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    // Limit to maximum 10 items by trimming pages near edges if needed
    while (rangeWithDots.length > 10) {
      const currentIndex = rangeWithDots.findIndex((item) => item === c);
      if (currentIndex !== -1 && currentIndex > rangeWithDots.length / 2) {
        // Current is in second half, remove one item from start side
        rangeWithDots.splice(2, 1);
      } else {
        // Current is in first half, remove one item from end side
        rangeWithDots.splice(-3, 1);
      }
    }

    return rangeWithDots;
  }, [current, totalPages]);

  return (
    <ul className="flex flex-row items-center gap-1 justify-center mt-[15px]">
      <li className={clsx(current === 0 && 'opacity-20 pointer-events-none')}>
        <div
          className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 gap-1 ps-2.5 text-gray-400 hover:text-white border-[#1F1F1F] hover:bg-forth"
          aria-label="Go to previous page"
          onClick={() => setPage(current - 1)}
        >
          <ChevronLeftIcon className="lucide lucide-chevron-left h-4 w-4" />
          <span>{t('previous', 'Previous')}</span>
        </div>
      </li>
      {paginationItems.map((item, index) => (
        <li key={index}>
          {item === '...' ? (
            <span className="inline-flex items-center justify-center h-10 w-10 text-textColor select-none">
              ...
            </span>
          ) : (
            <div
              aria-current="page"
              onClick={() => setPage(item - 1)}
              className={clsx(
                'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:bg-forth h-10 w-10 hover:text-white border-newBorder',
                current === item - 1
                  ? 'bg-forth !text-white'
                  : 'text-textColor hover:text-white'
              )}
            >
              {item}
            </div>
          )}
        </li>
      ))}
      <li
        className={clsx(
          current + 1 === totalPages && 'opacity-20 pointer-events-none'
        )}
      >
        <a
          className="text-textColor hover:text-white group cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 gap-1 pe-2.5 text-gray-400 border-[#1F1F1F] hover:bg-forth"
          aria-label="Go to next page"
          onClick={() => setPage(current + 1)}
        >
          <span>{t('next', 'Next')}</span>
          <ChevronRightIcon className="lucide lucide-chevron-right h-4 w-4" />
        </a>
      </li>
    </ul>
  );
};
export const ShowMediaBoxModal: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [callBack, setCallBack] =
    useState<(params: { id: string; path: string }[]) => void | undefined>();
  const closeModal = useCallback(() => {
    setShowModal(false);
    setCallBack(undefined);
  }, []);
  useEffect(() => {
    showModalEmitter.on('show-modal', (cCallback) => {
      setShowModal(true);
      setCallBack(() => cCallback);
    });
    return () => {
      showModalEmitter.removeAllListeners('show-modal');
    };
  }, []);
  if (!showModal) return null;
  return (
    <div className="text-textColor">
      <MediaBox setMedia={callBack!} closeModal={closeModal} />
    </div>
  );
};
export const showMediaBox = (
  callback: (params: { id: string; path: string }) => void
) => {
  showModalEmitter.emit('show-modal', callback);
};
const CHUNK_SIZE = 1024 * 1024;
const MAX_UPLOAD_SIZE = 1024 * 1024 * 1024; // 1 GB

const FolderSidebar: FC<{
  activeFolderId: string | null;
  onSelect: (id: string | null) => void;
  onFoldersChange: () => void;
}> = ({ activeFolderId, onSelect, onFoldersChange }) => {
  const fetch = useFetch();
  const t = useT();
  const toaster = useToaster();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: folders, mutate } = useMediaFolders();

  useEffect(() => {
    if (creating) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [creating]);

  const submitCreate = useCallback(async () => {
    const name = newName.trim();
    if (!name) {
      setCreating(false);
      setNewName('');
      return;
    }
    await fetch('/media/folders', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
    });
    setCreating(false);
    setNewName('');
    await mutate();
    onFoldersChange();
  }, [newName, fetch, mutate, onFoldersChange]);

  const deleteFolder = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (
        !(await deleteDialog(
          t('delete_folder_confirm', 'Delete folder? Media inside will be moved to All Media.')
        ))
      ) return;
      await fetch(`/media/folders/${id}`, { method: 'DELETE' });
      if (activeFolderId === id) onSelect(null);
      await mutate();
      onFoldersChange();
    },
    [activeFolderId, fetch, mutate, onSelect, onFoldersChange, t]
  );

  const folderItems = [
    { id: null, label: t('all_media', 'All Media') },
    { id: 'none', label: t('uncategorized', 'Uncategorized') },
  ];

  return (
    <div className="w-[180px] flex-shrink-0 flex flex-col gap-[2px] border-r border-newColColor pr-[12px]">
      <div className="text-[11px] font-[600] text-newTextColor/50 uppercase mb-[8px] tracking-wider">
        {t('folders', 'Folders')}
      </div>
      {folderItems.map((item) => (
        <button
          key={String(item.id)}
          onClick={() => onSelect(item.id)}
          className={clsx(
            'flex items-center gap-[8px] px-[10px] py-[8px] rounded-[6px] text-[13px] text-left w-full transition-colors',
            activeFolderId === item.id
              ? 'bg-[#612BD3] text-white'
              : 'text-textColor hover:bg-newColColor'
          )}
        >
          {activeFolderId === item.id ? (
            <FolderOpenIcon className="flex-shrink-0" />
          ) : (
            <FolderClosedIcon className="flex-shrink-0" />
          )}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
      {(folders || []).map((folder: { id: string; name: string }) => (
        <button
          key={folder.id}
          onClick={() => onSelect(folder.id)}
          className={clsx(
            'group flex items-center gap-[8px] px-[10px] py-[8px] rounded-[6px] text-[13px] text-left w-full transition-colors',
            activeFolderId === folder.id
              ? 'bg-[#612BD3] text-white'
              : 'text-textColor hover:bg-newColColor'
          )}
        >
          {activeFolderId === folder.id ? (
            <FolderOpenIcon className="flex-shrink-0" />
          ) : (
            <FolderClosedIcon className="flex-shrink-0" />
          )}
          <span className="flex-1 truncate">{folder.name}</span>
          <TrashIcon
            size={12}
            className={clsx(
              'flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400',
              activeFolderId === folder.id && 'text-white/70 hover:text-white'
            )}
            onClick={(e) => deleteFolder(folder.id, e)}
          />
        </button>
      ))}
      <div className="mt-[8px]">
        {creating ? (
          <div className="flex flex-col gap-[4px]">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate();
                if (e.key === 'Escape') { setCreating(false); setNewName(''); }
              }}
              placeholder={t('folder_name', 'Folder name')}
              className="w-full px-[8px] py-[6px] rounded-[6px] bg-newBgColorInner border border-[#612BD3] text-[12px] outline-none text-textColor"
            />
            <div className="flex gap-[4px]">
              <button
                onClick={submitCreate}
                className="flex-1 py-[4px] rounded-[4px] bg-[#612BD3] text-white text-[11px] font-[600]"
              >
                {t('save', 'Save')}
              </button>
              <button
                onClick={() => { setCreating(false); setNewName(''); }}
                className="flex-1 py-[4px] rounded-[4px] bg-newColColor text-textColor text-[11px]"
              >
                {t('cancel', 'Cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-[6px] px-[10px] py-[8px] rounded-[6px] text-[12px] text-newTextColor/50 hover:text-textColor hover:bg-newColColor w-full transition-colors"
          >
            <PlusIcon size={12} />
            {t('new_folder', 'New Folder')}
          </button>
        )}
      </div>
    </div>
  );
};

const MoveToFolderMenu: FC<{
  mediaId: string;
  currentFolderId: string | null;
  onMoved: () => void;
}> = ({ mediaId, currentFolderId, onMoved }) => {
  const fetch = useFetch();
  const t = useT();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: folders } = useMediaFolders();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const move = useCallback(
    async (folderId: string | null, e: React.MouseEvent) => {
      e.stopPropagation();
      await fetch(`/media/${mediaId}/folder`, {
        method: 'POST',
        body: JSON.stringify({ folderId }),
        headers: { 'Content-Type': 'application/json' },
      });
      setOpen(false);
      onMoved();
    },
    [mediaId, fetch, onMoved]
  );

  return (
    <div className="relative" ref={menuRef}>
      <div
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="cursor-pointer p-[3px] bg-black/60 rounded-[3px] hover:bg-black/80"
        title={t('move_to_folder', 'Move to folder')}
      >
        <FolderClosedIcon className="text-white w-[14px] h-[14px]" />
      </div>
      {open && (
        <div className="absolute bottom-[24px] right-0 z-[200] bg-newBgColor border border-newColColor rounded-[8px] shadow-lg min-w-[150px] py-[4px] text-[12px]">
          <div className="px-[10px] py-[4px] text-newTextColor/50 text-[10px] uppercase tracking-wider font-[600]">
            {t('move_to', 'Move to')}
          </div>
          <button
            onClick={(e) => move(null, e)}
            className={clsx(
              'flex items-center gap-[8px] px-[10px] py-[6px] w-full text-left hover:bg-newColColor transition-colors',
              currentFolderId === null && 'text-[#612BD3] font-[600]'
            )}
          >
            <FolderClosedIcon />
            {t('all_media', 'All Media')}
          </button>
          {(folders || []).map((folder: { id: string; name: string }) => (
            <button
              key={folder.id}
              onClick={(e) => move(folder.id, e)}
              className={clsx(
                'flex items-center gap-[8px] px-[10px] py-[6px] w-full text-left hover:bg-newColColor transition-colors truncate',
                currentFolderId === folder.id && 'text-[#612BD3] font-[600]'
              )}
            >
              <FolderClosedIcon />
              {folder.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const MediaBox: FC<{
  setMedia: (params: { id: string; path: string }[]) => void;
  standalone?: boolean;
  type?: 'image' | 'video';
  closeModal: () => void;
}> = ({ type, standalone, setMedia }) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(
    type === 'image' ? 'image' : type === 'video' ? 'video' : 'all'
  );
  const fetch = useFetch();
  const modals = useModals();
  const toaster = useToaster();

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, folderId, typeFilter]);

  const { data, mutate, isLoading } = useMediaList(page, debouncedSearch, folderId, typeFilter);
  const [selected, setSelected] = useState([]);
  const t = useT();
  const uploaderRef = useRef<any>(null);
  const mediaDirectory = useMediaDirectory();
  const [loading, setLoading] = useState(false);

  const uppy = useUppyUploader({
    allowedFileTypes:
      type == 'image'
        ? 'image/*'
        : type == 'video'
        ? 'video/mp4'
        : 'image/*,video/mp4',
    onUploadSuccess: async (arr) => {
      await mutate();
      if (standalone) return;
      setSelected((prevSelected) => [...prevSelected, ...arr]);
    },
    onStart: () => setLoading(true),
    onEnd: () => setLoading(false),
  });

  const addRemoveSelected = useCallback(
    (media: any) => () => {
      if (standalone) return;
      const exists = selected.find((p: any) => p.id === media.id);
      if (exists) {
        setSelected(selected.filter((f: any) => f.id !== media.id));
        return;
      }
      setSelected([...selected, media]);
    },
    [selected]
  );

  const addMedia = useCallback(async () => {
    if (standalone) return;
    // @ts-ignore
    setMedia(selected);
    modals.closeCurrent();
  }, [selected]);

  const addToUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > MAX_UPLOAD_SIZE) {
        toaster.show(
          t('upload_size_limit_exceeded', 'Upload size limit exceeded. Maximum 1 GB per upload session.'),
          'warning'
        );
        return;
      }
      setLoading(true);
      // @ts-ignore
      uppy.addFiles(files);
    },
    [toaster, t]
  );

  const dragAndDrop = useCallback(
    async (event: ClipboardEvent<HTMLDivElement> | File[]) => {
      // @ts-ignore
      const clipboardItems = event.map((p) => ({ kind: 'file', getAsFile: () => p }));
      if (!clipboardItems) return;
      const files: File[] = [];
      // @ts-ignore
      for (const item of clipboardItems) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > MAX_UPLOAD_SIZE) {
        toaster.show(
          t('upload_size_limit_exceeded', 'Upload size limit exceeded. Maximum 1 GB per upload session.'),
          'warning'
        );
        return;
      }
      setLoading(true);
      for (const file of files) uppy.addFile(file);
    },
    [toaster, t]
  );

  const maximize = useCallback(
    (media: Media) => async (e: any) => {
      e.stopPropagation();
      modals.openModal({
        title: '',
        top: 10,
        children: (
          <div className="w-full h-full p-[50px]">
            {media.path.indexOf('mp4') > -1 ? (
              <VideoFrame autoplay={true} url={mediaDirectory.set(media.path)} />
            ) : (
              <img
                width="100%"
                height="100%"
                className="w-full h-full max-h-[100%] max-w-[100%] object-cover"
                src={mediaDirectory.set(media.path)}
                alt="media"
              />
            )}
          </div>
        ),
      });
    },
    []
  );

  const deleteImage = useCallback(
    (media: Media) => async (e: any) => {
      e.stopPropagation();
      if (!(await deleteDialog(t('are_you_sure_you_want_to_delete_the_image', 'Are you sure you want to delete the image?')))) return;
      await fetch(`/media/${media.id}`, { method: 'DELETE' });
      mutate();
    },
    [mutate]
  );

  const typeFilterTabs: Array<{ key: TypeFilter; label: string }> = [
    { key: 'all', label: t('all', 'All') },
    { key: 'image', label: t('images', 'Images') },
    { key: 'video', label: t('videos', 'Videos') },
  ];

  const btn = useMemo(() => (
    <button
      disabled={loading}
      onClick={() => uploaderRef?.current?.click()}
      className="relative cursor-pointer bg-btnSimple changeColor flex gap-[8px] h-[44px] px-[18px] justify-center items-center rounded-[8px]"
    >
      {loading ? (
        <div className="absolute left-[50%] top-[50%] -translate-y-[50%] -translate-x-[50%]">
          <div className="animate-spin h-[20px] w-[20px] border-4 border-white border-t-transparent rounded-full" />
        </div>
      ) : (
        <PlusIcon size={14} />
      )}
      <div className={loading ? 'invisible' : undefined}>{t('upload', 'Upload')}</div>
    </button>
  ), [t, loading]);

  return (
    <DropFiles disabled={loading} className="flex flex-col flex-1" onDrop={dragAndDrop}>
      <div className="flex flex-row flex-1 gap-[16px] min-h-0">
        {/* Folder sidebar */}
        <FolderSidebar
          activeFolderId={folderId}
          onSelect={(id) => { setFolderId(id); setPage(0); }}
          onFoldersChange={() => mutate()}
        />

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Type filter tabs */}
          {!type && (
            <div className="flex gap-[4px] mb-[12px]">
              {typeFilterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTypeFilter(tab.key)}
                  className={clsx(
                    'px-[14px] py-[6px] rounded-[6px] text-[13px] font-[500] transition-colors',
                    typeFilter === tab.key
                      ? 'bg-[#612BD3] text-white'
                      : 'bg-newColColor text-textColor hover:bg-newColColor/80'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Search + upload */}
          <div
            className={clsx(
              'flex items-center gap-[12px]',
              !isLoading && !data?.results?.length && !debouncedSearch && 'hidden'
            )}
          >
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_media_by_name', 'Search by file name')}
                className="w-full h-[44px] px-[14px] rounded-[8px] bg-newBgColorInner border border-newColColor text-[14px] outline-none focus:border-[#612BD3]"
              />
            </div>
            <input type="file" ref={uploaderRef} onChange={addToUpload} className="hidden" multiple={true} />
            <div className="flex gap-[8px]">
              {btn}
              <ThirdPartyMediaLibrary onImported={() => mutate()} />
            </div>
          </div>

          {/* Upload progress bar */}
          <div className="w-full pointer-events-none relative mt-[5px] mb-[5px]">
            <div className="w-full h-[46px] overflow-hidden absolute left-0 bg-newBgColorInner uppyChange">
              <Dashboard
                height={46}
                uppy={uppy}
                id={`uploader`}
                showProgressDetails={true}
                hideUploadButton={true}
                hideRetryButton={true}
                hidePauseResumeButton={true}
                hideCancelButton={true}
                hideProgressAfterFinish={true}
              />
            </div>
            <div className="w-full h-[46px] uppyChange" />
          </div>

          {/* Media grid */}
          <div
            className={clsx(
              'flex-1 relative',
              !isLoading && !data?.results?.length && 'bg-newTextColor/[0.02] rounded-[12px]'
            )}
          >
            <div
              className={clsx(
                'absolute -left-[3px] -top-[3px] withp3 h-full overflow-x-hidden overflow-y-auto scrollbar scrollbar-thumb-newColColor scrollbar-track-newBgColorInner',
                !isLoading && !data?.results?.length && 'flex justify-center items-center gap-[20px] flex-col'
              )}
            >
              {!isLoading && !data?.results?.length && (
                <>
                  <NoMediaIcon />
                  <div className="text-[20px] font-[600]">
                    {debouncedSearch
                      ? t('no_media_match_search', 'No media matches your search')
                      : t('you_dont_have_any_media_yet', "You don't have any media yet")}
                  </div>
                  <div className="whitespace-pre-line text-newTextColor/[0.6] text-center">
                    {t('select_or_upload_pictures_max_1gb', 'Select or upload pictures (maximum 1 GB per upload).')}{' '}
                    {'\n'}
                    {t('you_can_drag_drop_pictures', 'You can also drag & drop pictures.')}
                  </div>
                  <div className="forceChange flex gap-[8px]">
                    {btn}
                    <ThirdPartyMediaLibrary onImported={() => mutate()} />
                  </div>
                </>
              )}
              {isLoading && (
                <>
                  {[...new Array(16)].map((_, i) => (
                    <div className="px-[3px] py-[3px] float-left rounded-[6px] cursor-pointer w8-max aspect-square" key={i}>
                      <div className="w-full h-full bg-newSep rounded-[6px] animate-pulse" />
                    </div>
                  ))}
                </>
              )}
              {data?.results?.map((media: any) => (
                <div
                  className={clsx(
                    'group px-[3px] py-[3px] float-left rounded-[6px] w8-max aspect-square',
                    !standalone && 'cursor-pointer'
                  )}
                  key={media.id}
                >
                  <div
                    className={clsx(
                      'w-full h-full rounded-[6px] border-[4px] relative',
                      !!selected.find((p) => p.id === media.id)
                        ? 'border-[#612BD3]'
                        : 'border-transparent'
                    )}
                    onClick={addRemoveSelected(media)}
                  >
                    {!!selected.find((p: any) => p.id === media.id) ? (
                      <div className="text-white flex z-[101] justify-center items-center text-[14px] font-[500] w-[24px] h-[24px] rounded-full bg-[#612BD3] absolute -bottom-[10px] -end-[10px]">
                        {selected.findIndex((z: any) => z.id === media.id) + 1}
                      </div>
                    ) : (
                      <DeleteCircleIcon
                        className="cursor-pointer hidden z-[100] group-hover:block absolute -top-[5px] -end-[5px]"
                        onClick={deleteImage(media)}
                      />
                    )}

                    {/* Move to folder button */}
                    <div
                      className="hidden group-hover:flex absolute -top-[5px] -start-[5px] z-[100]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoveToFolderMenu
                        mediaId={media.id}
                        currentFolderId={media.folderId}
                        onMoved={() => mutate()}
                      />
                    </div>

                    <div className="w-full h-full rounded-[6px] overflow-hidden relative">
                      <div className="absolute z-[20] left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]">
                        <div
                          onClick={maximize(media)}
                          className="cursor-pointer p-[4px] bg-black/40 hidden group-hover:block hover:scale-150 transition-all"
                        >
                          <svg width="30" height="30" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 9H0V14H5V12H2V9ZM0 5H2V2H5V0H0V5ZM12 12H9V14H14V9H12V12ZM9 0V2H12V5H14V0H9Z" fill="#F1F5F9" />
                          </svg>
                        </div>
                      </div>
                      {media.path.indexOf('mp4') > -1 ? (
                        <VideoFrame url={mediaDirectory.set(media.path)} />
                      ) : (
                        <img
                          width="100%"
                          height="100%"
                          className="w-full h-full object-cover"
                          src={mediaDirectory.set(media.path)}
                          alt="media"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(data?.pages || 0) > 1 && (
            <Pagination current={page} totalPages={data?.pages} setPage={setPage} />
          )}

          {!standalone && (
            <div className="flex justify-end mt-[32px] gap-[8px]">
              <button
                onClick={() => modals.closeCurrent()}
                className="cursor-pointer h-[52px] px-[20px] items-center justify-center border border-newTextColor/10 flex rounded-[10px]"
              >
                {t('cancel', 'Cancel')}
              </button>
              {!isLoading && !!data?.results?.length && (
                <button
                  onClick={standalone ? () => {} : addMedia}
                  disabled={selected.length === 0}
                  className="cursor-pointer text-white disabled:opacity-80 disabled:cursor-not-allowed h-[52px] px-[20px] items-center justify-center bg-[#612BD3] flex rounded-[10px]"
                >
                  {t('add_selected_media', 'Add selected media')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DropFiles>
  );
};
export const MultiMediaComponent: FC<{
  label: string;
  description: string;
  mediaNotAvailable?: boolean;
  dummy: boolean;
  allData: {
    content: string;
    id?: string;
    image?: Array<{
      id: string;
      path: string;
    }>;
  }[];
  value?: Array<{
    path: string;
    id: string;
  }>;
  text: string;
  name: string;
  error?: any;
  onOpen?: () => void;
  onClose?: () => void;
  toolBar?: React.ReactNode;
  information?: React.ReactNode;
  onChange: (event: {
    target: {
      name: string;
      value?: Array<{
        id: string;
        path: string;
        alt?: string;
        thumbnail?: string;
        thumbnailTimestamp?: number;
      }>;
    };
  }) => void;
}> = (props) => {
  const {
    name,
    error,
    text,
    onChange,
    value,
    allData,
    dummy,
    toolBar,
    information,
    mediaNotAvailable,
  } = props;
  const user = useUser();
  const modals = useModals();
  const t = useT();
  useEffect(() => {
    if (value) {
      setCurrentMedia(value);
    }
  }, [value]);

  const [currentMedia, setCurrentMedia] = useState(value);
  const mediaDirectory = useMediaDirectory();
  const changeMedia = useCallback(
    (
      m:
        | {
            path: string;
            id: string;
          }
        | {
            path: string;
            id: string;
          }[]
    ) => {
      const mediaArray = Array.isArray(m) ? m : [m];
      const newMedia = [...(currentMedia || []), ...mediaArray];
      setCurrentMedia(newMedia);
      onChange({
        target: {
          name,
          value: newMedia,
        },
      });
    },
    [currentMedia]
  );
  const showModal = useCallback(() => {
    modals.openModal({
      title: t('media_library', 'Media Library'),
      askClose: false,
      closeOnEscape: true,
      fullScreen: true,
      size: 'calc(100% - 80px)',
      height: 'calc(100% - 80px)',
      children: (close) => (
        <MediaBox setMedia={changeMedia} closeModal={close} />
      ),
    });
  }, [changeMedia, t]);

  const clearMedia = useCallback(
    (topIndex: number) => () => {
      const newMedia = currentMedia?.filter((f, index) => index !== topIndex);
      setCurrentMedia(newMedia);
      onChange({
        target: {
          name,
          value: newMedia,
        },
      });
    },
    [currentMedia]
  );

  const designMedia = useCallback(() => {
    if (!!user?.tier?.ai && !dummy) {
      modals.openModal({
        askClose: false,
        title: t('design_media', 'Design Media'),
        size: '80%',
        children: (close) => (
          <Polonto setMedia={changeMedia} closeModal={close} />
        ),
      });
    }
  }, [changeMedia, t]);

  return (
    <>
      <div className="b1 flex flex-col gap-[8px] rounded-bl-[8px] select-none w-full">
        <div className="flex gap-[10px] px-[12px]">
          {!!currentMedia && (
            <ReactSortable
              list={currentMedia}
              setList={(value) =>
                onChange({ target: { name: 'upload', value } })
              }
              className="flex gap-[10px] sortable-container"
              animation={200}
              swap={true}
              handle=".dragging"
            >
              {currentMedia.map((media, index) => (
                  <div key={media.id} className="cursor-pointer rounded-[5px] w-[40px] h-[40px] border-2 border-tableBorder relative flex transition-all">
                    <DragHandleIcon className="z-[20] dragging absolute pe-[1px] pb-[3px] -start-[4px] -top-[4px] cursor-move" />

                    <div className="w-full h-full relative group">
                      <div
                        onClick={async () => {
                          modals.openModal({
                            title: t('media_settings', 'Media Settings'),
                            children: (close) => (
                              <MediaComponentInner
                                media={media as any}
                                onClose={close}
                                onSelect={(value: any) => {
                                  onChange({
                                    target: {
                                      name: 'upload',
                                      value: currentMedia.map((p) => {
                                        if (p.id === media.id) {
                                          return {
                                            ...p,
                                            ...value,
                                          };
                                        }
                                        return p;
                                      }),
                                    },
                                  });
                                }}
                              />
                            ),
                          });
                        }}
                        className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-black/80 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-[9]"
                      >
                        <MediaSettingsIcon className="cursor-pointer relative z-[200]" />
                      </div>
                      {media?.path?.indexOf('mp4') > -1 ? (
                        <VideoFrame url={mediaDirectory.set(media?.path)} />
                      ) : (
                        <img
                          className="w-full h-full object-cover rounded-[4px]"
                          src={mediaDirectory.set(media?.path)}
                        />
                      )}
                    </div>

                    <CloseCircleIcon
                      onClick={clearMedia(index)}
                      className="absolute -end-[4px] -top-[4px] z-[20] rounded-full bg-white"
                    />
                  </div>
              ))}
            </ReactSortable>
          )}
        </div>
        <div className="flex gap-[8px] px-[12px] border-t border-newColColor w-full b1 text-textColor">
          {!mediaNotAvailable && (
            <div className="flex py-[10px] b2 items-center gap-[4px]">
              <div
                onClick={showModal}
                className="cursor-pointer h-[30px] rounded-[6px] justify-center items-center flex bg-newColColor px-[8px]"
              >
                <div className="flex gap-[8px] items-center">
                  <div>
                    <InsertMediaIcon />
                  </div>
                  <div className="text-[10px] font-[600] maxMedia:hidden block">
                    {t('insert_media', 'Insert Media')}
                  </div>
                </div>
              </div>
              <div
                onClick={designMedia}
                className="cursor-pointer h-[30px] rounded-[6px] justify-center items-center flex bg-newColColor px-[8px]"
              >
                <div className="flex gap-[5px] items-center">
                  <div>
                    <DesignMediaIcon />
                  </div>
                  <div className="text-[10px] font-[600] iconBreak:hidden block">
                    {t('design_media', 'Design Media')}
                  </div>
                </div>
              </div>

              <ThirdPartyMedia allData={allData} onChange={changeMedia} />

              {!!user?.tier?.ai && (
                <>
                  <AiImage value={text} onChange={changeMedia} />
                  <AiVideo value={text} onChange={changeMedia} />
                </>
              )}
            </div>
          )}
          {!mediaNotAvailable && (
            <div className="text-newColColor h-full flex items-center">
              <VerticalDividerIcon />
            </div>
          )}
          {!!toolBar && (
            <div className="flex py-[10px] b2 items-center gap-[4px]">
              {toolBar}
            </div>
          )}
          {information && (
            <div className="flex-1 justify-end flex py-[10px] b2 items-center gap-[4px]">
              {information}
            </div>
          )}
        </div>
      </div>
      <div className="text-[12px] text-red-400">{error}</div>
    </>
  );
};
export const MediaComponent: FC<{
  label: string;
  description: string;
  value?: {
    path: string;
    id: string;
  };
  name: string;
  onChange: (event: {
    target: {
      name: string;
      value?: {
        id: string;
        path: string;
      };
    };
  }) => void;
  type?: 'image' | 'video';
  width?: number;
  height?: number;
}> = (props) => {
  const t = useT();

  const { name, type, label, description, onChange, value, width, height } =
    props;
  const { getValues } = useSettings();
  const user = useUser();
  useEffect(() => {
    const settings = getValues()[props.name];
    if (settings) {
      setCurrentMedia(settings);
    }
  }, []);
  const [currentMedia, setCurrentMedia] = useState(value);
  const modals = useModals();
  const mediaDirectory = useMediaDirectory();

  const showDesignModal = useCallback(() => {
    modals.openModal({
      title: t('media_editor', 'Media Editor'),
      askClose: false,
      closeOnEscape: true,
      fullScreen: true,
      size: 'calc(100% - 80px)',
      height: 'calc(100% - 80px)',
      children: (close) => (
        <Polonto
          width={width}
          height={height}
          setMedia={changeMedia}
          closeModal={close}
        />
      ),
    });
  }, [t]);
  const changeMedia = useCallback((m: { path: string; id: string }[]) => {
    setCurrentMedia(m[0]);
    onChange({
      target: {
        name,
        value: m[0],
      },
    });
  }, []);
  const showModal = useCallback(() => {
    modals.openModal({
      title: t('media_library', 'Media Library'),
      askClose: false,
      closeOnEscape: true,
      fullScreen: true,
      size: 'calc(100% - 80px)',
      height: 'calc(100% - 80px)',
      children: (close) => (
        <MediaBox setMedia={changeMedia} closeModal={close} type={type} />
      ),
    });
  }, [t]);
  const clearMedia = useCallback(() => {
    setCurrentMedia(undefined);
    onChange({
      target: {
        name,
        value: undefined,
      },
    });
  }, [value]);
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="text-[14px]">{label}</div>
      <div className="text-[12px]">{description}</div>
      {!!currentMedia && (
        <div className="my-[20px] cursor-pointer w-[200px] h-[200px] border-2 border-tableBorder">
          <img
            className="w-full h-full object-cover"
            src={currentMedia.path}
            onClick={() => window.open(mediaDirectory.set(currentMedia.path))}
          />
        </div>
      )}
      <div className="flex gap-[5px]">
        <Button onClick={showModal}>{t('select', 'Select')}</Button>
        <Button onClick={showDesignModal} className="!bg-customColor45">
          {t('editor', 'Editor')}
        </Button>
        <Button secondary={true} onClick={clearMedia}>
          {t('clear', 'Clear')}
        </Button>
      </div>
    </div>
  );
};
