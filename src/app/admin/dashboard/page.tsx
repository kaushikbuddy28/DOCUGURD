"use client";

import { useEffect, useState }from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { Loader2 }from 'lucide-react';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const usersSnapshot = await getDocs(collection(firestore, 'users'));
          setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // For simplicity, fetching all documents. In a real app, you might paginate
          const allDocuments: any[] = [];
          for (const u of usersSnapshot.docs) {
            const docsSnapshot = await getDocs(collection(firestore, `users/${u.id}/documents`));
            docsSnapshot.forEach(doc => {
              allDocuments.push({ id: doc.id, userId: u.id, ...doc.data() });
            });
          }
          setDocuments(allDocuments);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, firestore]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };
  
  if (isUserLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // or a redirect component
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Admin Dashboard</h2>
                <Button onClick={handleSignOut}>Sign Out</Button>
            </div>
            
            <div className="grid gap-6">
            <Card>
                <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>List of all registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registration Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users.map((u) => (
                        <TableRow key={u.id}>
                        <TableCell className="font-mono text-xs">{u.id}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.registrationDate ? new Date(u.registrationDate).toLocaleDateString() : 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>List of all documents uploaded by users.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Document ID</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>File Type</TableHead>
                        <TableHead>Owner User ID</TableHead>
                        <TableHead>Upload Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {documents.map((doc) => (
                        <TableRow key={doc.id}>
                        <TableCell className="font-mono text-xs">{doc.id}</TableCell>
                        <TableCell>{doc.fileName}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{doc.fileType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{doc.userId}</TableCell>
                        <TableCell>{doc.uploadDate ? new Date(doc.uploadDate.seconds * 1000).toLocaleString() : 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
