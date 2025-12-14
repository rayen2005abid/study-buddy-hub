import React, { useEffect, useState } from 'react';
import { getQuestions, createQuestion, createAnswer } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Community = () => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});

    const studentId = 1; // Mocked logged-in user

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const data = await getQuestions();
            setQuestions(data.reverse()); // Show newest first
        } catch (error) {
            console.error("Failed to load questions", error);
        }
    };

    const handlePostQuestion = async () => {
        if (!newTitle || !newContent) return;
        await createQuestion(newTitle, newContent, studentId);
        setNewTitle('');
        setNewContent('');
        loadQuestions();
    };

    const handlePostAnswer = async (questionId: number) => {
        const content = replyContent[questionId];
        if (!content) return;

        await createAnswer(content, questionId, studentId);
        setReplyContent({ ...replyContent, [questionId]: '' });
        loadQuestions(); // Reload to see new answer
    };

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Community Q&A</h1>

                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Ask a Question</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="What's your question?"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                        <Button variant="gradient" onClick={handlePostQuestion}>Post Question</Button>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {questions.map((q) => (
                        <Card key={q.id} variant="glass" className="overflow-hidden">
                            <CardHeader className="bg-muted/20 pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{q.title}</CardTitle>
                                    <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{q.content}</p>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    {q.answers && q.answers.map((a: any) => (
                                        <div key={a.id} className="bg-secondary/20 p-3 rounded-lg text-sm">
                                            <p>{a.content}</p>
                                        </div>
                                    ))}

                                    <div className="flex gap-2 mt-4">
                                        <Input
                                            placeholder="Write an answer..."
                                            value={replyContent[q.id] || ''}
                                            onChange={(e) => setReplyContent({ ...replyContent, [q.id]: e.target.value })}
                                        />
                                        <Button variant="secondary" onClick={() => handlePostAnswer(q.id)}>Reply</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Community;
