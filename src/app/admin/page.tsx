import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth';
import {
  getPlants,
  getAquariums,
  getPlantCategories,
  getAquariumCategories,
} from '@/lib/catalogService';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const metadata = {
  title: 'Staff Admin Console • Nature House Bangalore',
  description: 'Manage botanical nursery plants, handcrafted rimless aquariums, and model cards.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface AdminPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const headerList = await headers();
  const referer = headerList.get('referer') || '';

  // 1. Cryptographic session verification
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    redirect('/admin/login');
  }

  // 2. Direct URL & Customer-Storefront Access Challenge:
  // If the user navigates directly to /admin in the URL bar (empty/external referer)
  // or arrives from the public store (/), always challenge for password via /admin/login.
  const hasValidReferer = referer && (referer.includes('/admin') || referer.includes('/admin/login'));
  const hasSessionParam = searchParams?.session === 'active';

  if (!hasValidReferer && !hasSessionParam) {
    redirect('/admin/login');
  }

  const [plants, aquariums, plantCategories, aquaCategories] = await Promise.all([
    getPlants(),
    getAquariums(),
    getPlantCategories(),
    getAquariumCategories(),
  ]);

  return (
    <AdminDashboardClient
      initialPlants={plants}
      initialAquariums={aquariums}
      plantCategories={plantCategories}
      aquaCategories={aquaCategories}
    />
  );
}
