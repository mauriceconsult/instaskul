export const apiRoutes = {
  noticeboards: {
    title: (adminId: string, noticeboardId: string) =>
      `/api/admins/${adminId}/noticeboards/${noticeboardId}/titles`,
  },
};
