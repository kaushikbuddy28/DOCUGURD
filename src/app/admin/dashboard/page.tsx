"use client";

import { useEffect, useState }from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { Loader2 }from 'lucide-react';

// Define types for our data for better type safety
interface UserData {
  id: string;
  email: string;
  registrationDate?: string;
}

interface DocumentData {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  uploadDate?: { seconds: number; nanoseconds: number; } | Timestamp;
}


export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If auth state is loaded and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Fetch data only if there is a user and firestore is initialized.
    if (user && firestore) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch all users
          const usersSnapshot = await getDocs(collection(firestore, 'users'));
          const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
          setUsers(usersData);

          // Fetch all documents for all users
          const allDocuments: DocumentData[] = [];
          for (const u of usersData) {
            const docsSnapshot = await getDocs(collection(firestore, `users/${u.id}/documents`));
            docsSnapshot.forEach(doc => {
              allDocuments.push({ id: doc.id, userId: u.id, ...doc.data() } as DocumentData);
            });
          }
          setDocuments(allDocuments);
        } catch (error) {
          console.error("Error fetching admin data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, firestore]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };
  
  // Display a loading spinner while user auth or data fetching is in progress.
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

  // If there's no user, we're likely about to redirect, so render nothing.
  if (!user) {
    return null;
  }

  // Helper to format Firestore Timestamps or date strings
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (typeof date === 'string') {
        return new Date(date).toLocaleString();
    }
    if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleString();
    }
    return 'Invalid Date';
  };

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
                        <TableCell>{formatDate(u.registrationDate)}</TableCell>
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
                        <TableCell>{formatDate(doc.uploadDate)}</TableCell>
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
