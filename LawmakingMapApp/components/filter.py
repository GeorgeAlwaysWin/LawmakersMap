from django_unicorn.components import UnicornView

class FilterView(UnicornView):
    btnMark = ">"
    width_percent=20
    def hide(self):
        if self.btnMark == ">":
            self.btnMark = "<"
            self.width_percent=0
            return
        if self.btnMark == "<":
            self.btnMark = ">"
            self.width_percent=20

