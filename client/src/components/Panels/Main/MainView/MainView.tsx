import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import EditorWithTabs from "./EditorWithTabs";
import MainViewLoading from "./MainViewLoading";
import Tutorials from "./Tutorials";
import { EventName, Route } from "../../../../constants";
import { PgCommon, PgView } from "../../../../utils/pg";
import { TUTORIALS } from "../../../../tutorials";

const MainView = () => {
  const [El, setEl] = useState(EditorWithTabs);
  const [loading, setLoading] = useState(true);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    (async () => {
      if (pathname.startsWith(Route.TUTORIALS)) {
        if (pathname === Route.TUTORIALS) {
          await PgCommon.sleep(500);
          PgView.setMain(Tutorials);
        } else {
          const tutorial = TUTORIALS.find(
            (t) =>
              PgCommon.toKebabCase(t.name) ===
              pathname.split(`${Route.TUTORIALS}/`)[1]
          );
          if (!tutorial) {
            navigate(Route.TUTORIALS);
            return;
          }

          const { default: El } = await tutorial.elementImport();
          PgView.setMain(() => <El {...tutorial} />);
        }
      } else {
        PgView.setMain(EditorWithTabs);
      }
      setLoading(false);
    })();
  }, [pathname, navigate]);

  useEffect(() => {
    const handleSetMainView = (
      e: UIEvent & { detail: { El: () => JSX.Element } }
    ) => {
      setEl(e.detail.El ?? EditorWithTabs);
    };

    document.addEventListener(
      EventName.VIEW_MAIN_SET,
      handleSetMainView as EventListener
    );
    return () =>
      document.removeEventListener(
        EventName.VIEW_MAIN_SET,
        handleSetMainView as EventListener
      );
  }, []);

  if (loading) return <MainViewLoading tutorialsBg />;

  return El;
};

export default MainView;